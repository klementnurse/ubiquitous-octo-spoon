import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Switch, Route } from 'react-router-dom'
import * as faker from 'faker'
import * as Sentry from '@sentry/browser'
import { createMemoryHistory } from 'history'
import {
  generateCampaignMailer,
  generatePageData,
  testRender
} from '../../test'
import * as LegacyService from '../../services/legacy'
import * as OptoutService from '../../services/optout'
import Landing, { LandingPageProps } from './Landing'
import { OptoutType, ServerUnavailableError } from '../../contracts'

jest.mock('../../services/legacy')
jest.mock('../../services/optout')

jest.useFakeTimers()

const mockedLegacyService = LegacyService as unknown as jest.Mocked<
  typeof LegacyService
>
const mockedOptoutService = OptoutService as unknown as jest.Mocked<
  typeof OptoutService
>

describe('<Landing />', () => {
  const optoutListKey = 'o-crlc-h92-0b8436ae30728c2840f52388ca6195e9'
  const confirmationContent = faker.random.words(10)
  const verifyKeySuccessResponse = generateCampaignMailer({
    legacyKey: optoutListKey
  })
  const pageDataSuccessResponse = generatePageData()
  const emailThatCollectsFeedback = 'testclb@gmail.com'
  const emailThatDoesNotCollectFeedback = 'testnotclb@gmail.com'

  interface SetupParams {
    props?: LandingPageProps
    state?: {}
    overrideContext?: {}
    oneClickOptout?: string
  }

  const setup = ({
    props = {},
    state = {},
    overrideContext = {},
    oneClickOptout
  }: SetupParams = {}) => {
    const history = createMemoryHistory({
      initialEntries: [
        `/${optoutListKey}${oneClickOptout ? `?email=${oneClickOptout}` : ''}`
      ]
    })

    return testRender(
      <Switch>
        <Route path='/:legacyKey'>
          <Landing {...props} />
        </Route>
        <Route exact path='/confirmation'>
          <>{confirmationContent}</>
        </Route>
      </Switch>,
      state,
      history,
      overrideContext
    )
  }

  const waitForScreenToBeReady = async () => {
    await waitFor(() => {
      expect(screen.getByTestId('landing-form')).toBeInTheDocument()
    })
  }

  const enterOptoutAndSubmit = (optout: string) => {
    const optoutInput = screen.getByRole('textbox')
    const submitButton = screen.getByRole('button', { name: 'Unsubscribe' })

    userEvent.clear(optoutInput)
    userEvent.type(optoutInput, optout)
    userEvent.click(submitButton)
  }

  beforeEach(() => {
    /* All service mocks are successful by default, but can be overridden for lower
    tests. */
    mockedLegacyService.verifyKey.mockResolvedValue(verifyKeySuccessResponse)
    mockedOptoutService.fetchPageData.mockResolvedValue(pageDataSuccessResponse)
    mockedOptoutService.submitOptout.mockResolvedValue()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  /**
   * Tests should not use the context to pass in state, instead relying on the
   * data loading logic in this component. i.e. mock out `mockedLegacyService.verifyKey`
   * and `mockedOptoutService.fetchPageData` to achieve the required state.
   */

  describe('when loading data', () => {
    it('should show a loading indicator', async () => {
      setup()

      await waitFor(() => {
        expect(screen.getByTestId('spinner')).toBeInTheDocument()
      })
    })

    describe('when the legacy token service responds with a 400 range error', () => {
      it('should display a "not found" error', async () => {
        const mockAxiosNotFoundError = {
          request: {},
          response: {
            status: 404
          },
          message: 'Not Found'
        }
        mockedLegacyService.verifyKey.mockRejectedValue(mockAxiosNotFoundError)
        setup()

        await waitFor(() => {
          expect(screen.getByTestId('spinner')).toBeInTheDocument()
        })

        expect(
          await screen.findByText(/We could not find the right page/i)
        ).toBeInTheDocument()

        // We shouldn't retry on a 400 range response.
        expect(mockedLegacyService.verifyKey).toHaveBeenCalledTimes(1)
      })
    })

    describe('when the legacy token service fails to decrypt the opt-out key', () => {
      let sentrySpy: jest.SpyInstance

      beforeEach(() => {
        mockedLegacyService.verifyKey.mockRejectedValue(
          new ServerUnavailableError('Uh oh!')
        )
        sentrySpy = jest.spyOn(Sentry, 'captureMessage')
      })

      afterEach(() => {
        sentrySpy.mockRestore()
      })

      it('should fall back to a basic opt-out form', async () => {
        const { history } = setup()

        await waitFor(() => {
          expect(screen.getByTestId('spinner')).toBeInTheDocument()
        })

        await waitFor(() => {
          const originalApiAttempts = 3
          const fallbackApiAttempts = 3
          expect(mockedLegacyService.verifyKey).toHaveBeenCalledTimes(originalApiAttempts + fallbackApiAttempts)
        })

        // Default page data title.
        expect(
          screen.getByRole('heading', {
            name: /Please specify an email address that you would like removed./i
          })
        ).toBeInTheDocument()

        enterOptoutAndSubmit(emailThatDoesNotCollectFeedback)

        // The opt-out should still be captured via `.captureMessage()`.
        expect(sentrySpy).toHaveBeenCalledWith(
          expect.stringMatching(/Opt-Out key failed to load/i),
          expect.objectContaining({
            contexts: {
              'attempted optout': {
                key: optoutListKey,
                emailOptout: emailThatDoesNotCollectFeedback,
                smsOptout: undefined,
                // None of this is available because we couldn't decrypt the key.
                campaignId: undefined,
                mailerId: undefined,
                cmaId: undefined
              }
            }
          })
        )

        expect(mockedOptoutService.submitOptout).not.toHaveBeenCalled()

        await waitFor(() => {
          expect(history.location.pathname).toBe('/confirmation')
        })
      })
    })

    describe('when the optout list key is valid', () => {
      it('should fetch opt-out page data and update the global context', async () => {
        setup()

        await waitFor(() => {
          expect(mockedLegacyService.verifyKey).toHaveBeenCalledWith(
            optoutListKey
          )
          expect(mockedOptoutService.fetchPageData).toHaveBeenCalledWith(
            verifyKeySuccessResponse.campaignId,
            verifyKeySuccessResponse.optoutType
          )
        })

        // Context has been updated for this content to render.
        expect(
          screen.getByRole('heading', {
            name: pageDataSuccessResponse.landing.title
          })
        ).toBeInTheDocument()
        expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
      })
    })

    describe('when the opt-out page data requests invalid data', () => {
      beforeEach(async () => {
        const mockAxiosNotFoundError = {
          request: {},
          response: {
            status: 404
          },
          message: 'Not Found'
        }
        mockedOptoutService.fetchPageData
          .mockClear()
          .mockRejectedValue(mockAxiosNotFoundError)
        setup({ oneClickOptout: emailThatDoesNotCollectFeedback })

        await waitFor(() => {
          expect(mockedOptoutService.fetchPageData).toHaveBeenCalled()
        })
      })

      it('should display an error for 400 responses', () => {
        expect(
          screen.getByText('This opt-out link is no longer active')
        ).toBeInTheDocument()
        expect(screen.queryByTestId('landing-form')).toBeNull()
      })

      it('should not auto-submit the email', () => {
        expect(mockedOptoutService.submitOptout).not.toHaveBeenCalled()
      })
    })
  })

  describe('when one click opt-out is set', () => {
    it('should immediately submit the opt-out', async () => {
      setup({ oneClickOptout: emailThatDoesNotCollectFeedback })
      await waitForScreenToBeReady()

      await waitFor(() => {
        expect(mockedOptoutService.submitOptout).toHaveBeenCalledWith(
          verifyKeySuccessResponse.campaignId,
          expect.objectContaining({
            email: emailThatDoesNotCollectFeedback
          })
        )
      })
    })

    it('should discard invalid opt-outs', async () => {
      const sentrySpy = jest.spyOn(Sentry, 'captureMessage')

      const invalidOptout = '1234/5678/890/12'
      setup({ oneClickOptout: invalidOptout })
      await waitForScreenToBeReady()

      // Expect opt-out to not be submitted, and relevant information sent to Sentry
      expect(mockedOptoutService.submitOptout).not.toHaveBeenCalled()

      expect(sentrySpy).toHaveBeenCalledWith(
        expect.stringMatching(/Invalid one-click opt-out discarded/i),
        expect.objectContaining({
          contexts: {
            'discarded one-click opt-out': {
              oneClickOptout: invalidOptout,
              campaignId: verifyKeySuccessResponse.campaignId,
              mailerId: verifyKeySuccessResponse.mailerId,
              cmaId: verifyKeySuccessResponse.cmaId,
              sourceClientId: verifyKeySuccessResponse.sourceClientId,
              optoutType: verifyKeySuccessResponse.optoutType
            }
          }
        })
      )
    })

    it('should discard opt-outs of incompatible optout type', async () => {
      const sentrySpy = jest.spyOn(Sentry, 'captureMessage')

      // SMS optout for email only campaign mailer (default)
      const smsOptout = '0412345678'
      setup({ oneClickOptout: smsOptout })
      await waitForScreenToBeReady()

      // Expect opt-out to not be submitted, and relevant information sent to Sentry
      expect(mockedOptoutService.submitOptout).not.toHaveBeenCalled()

      expect(sentrySpy).toHaveBeenCalledWith(
        expect.stringMatching(/Invalid one-click opt-out discarded/i),
        expect.objectContaining({
          contexts: {
            'discarded one-click opt-out': {
              oneClickOptout: smsOptout,
              campaignId: verifyKeySuccessResponse.campaignId,
              mailerId: verifyKeySuccessResponse.mailerId,
              cmaId: verifyKeySuccessResponse.cmaId,
              sourceClientId: verifyKeySuccessResponse.sourceClientId,
              optoutType: verifyKeySuccessResponse.optoutType
            }
          }
        })
      )
    })
  })

  describe('when submitting the opt-out', () => {
    it('should submit the opt-out to the API', async () => {
      setup()
      await waitForScreenToBeReady()

      // Button is the loading state. No loading state.
      expect(screen.queryByRole('button', { name: 'Unsubscribing' })).toBeNull()

      enterOptoutAndSubmit(emailThatDoesNotCollectFeedback)

      // Loading state.
      expect(
        screen.getByRole('button', { name: 'Unsubscribing' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Unsubscribing' })
      ).toHaveAttribute('disabled')

      await waitFor(() => {
        expect(mockedOptoutService.submitOptout).toHaveBeenCalled()
      })

      // No loading state.
      expect(screen.queryByRole('button', { name: 'Unsubscribing' })).toBeNull()
    })

    it('should navigate to the confirmation screen', async () => {
      mockedLegacyService.verifyKey.mockResolvedValue({
        ...verifyKeySuccessResponse,
        // Never redirect to ads after an opt-out.
        optoutAdRatio: 0
      })
      const { history } = setup()
      await waitForScreenToBeReady()

      enterOptoutAndSubmit(emailThatDoesNotCollectFeedback)

      await waitFor(() => {
        expect(history.location.pathname).toBe('/confirmation')
      })

      expect(history.location.state).toEqual({
        email: emailThatDoesNotCollectFeedback,
        sms: '',
        showAd: false,
        collectFeedback: false
      })
    })

    it('should redirect to an ad when the ad ratio is sufficient', async () => {
      mockedLegacyService.verifyKey.mockResolvedValue({
        ...verifyKeySuccessResponse,
        // Always redirect to ads after an opt-out.
        optoutAdRatio: 1
      })
      const { history } = setup()
      await waitForScreenToBeReady()
      // Redirect to ad even if feedback collection would be triggered.
      enterOptoutAndSubmit(emailThatCollectsFeedback)

      await waitFor(() => {
        expect(mockedOptoutService.submitOptout).toHaveBeenCalledWith(
          verifyKeySuccessResponse.campaignId,
          {
            mailerId: verifyKeySuccessResponse.mailerId,
            email: emailThatCollectsFeedback,
            sms: undefined,
            cmaId: verifyKeySuccessResponse.cmaId,
            preference: [],
            sourceClientId: verifyKeySuccessResponse.sourceClientId,
            wasRedirectedToAds: true
          }
        )
      })

      expect(history.location.pathname).toBe('/confirmation')
      expect(history.location.state).toEqual({
        email: emailThatCollectsFeedback,
        sms: '',
        showAd: true,
        collectFeedback: false
      })
    })

    it('will redirect to collect feedback when the provided email is feedback worthy and not redirected to ad', async () => {
      mockedLegacyService.verifyKey.mockResolvedValue({
        ...verifyKeySuccessResponse,
        optoutAdRatio: 0
      })
      const { history } = setup()
      await waitForScreenToBeReady()
      enterOptoutAndSubmit(emailThatCollectsFeedback)

      await waitFor(() => {
        expect(history.location.pathname).toBe('/confirmation')
      })

      expect(history.location.state).toEqual({
        email: emailThatCollectsFeedback,
        sms: '',
        showAd: false,
        collectFeedback: true
      })
    })

    it('will not collect feedback for SMS optouts', async () => {
      const phoneNumber = '18083443434'
      mockedLegacyService.verifyKey.mockResolvedValue({
        ...verifyKeySuccessResponse,
        // Feedback is normally only collecting when there is no ad redirects.
        optoutAdRatio: 0,
        optoutType: OptoutType.SMS
      })
      const { history } = setup()
      await waitForScreenToBeReady()
      enterOptoutAndSubmit(phoneNumber)

      await waitFor(() => {
        expect(history.location.pathname).toBe('/confirmation')
      })

      expect(history.location.state).toEqual({
        email: '',
        sms: phoneNumber,
        showAd: false,
        collectFeedback: false
      })
    })

    describe('when the submission request fails', () => {
      let sentrySpy: jest.SpyInstance
      let consoleSpy: jest.SpyInstance

      beforeEach(() => {
        /* Mock console.error to prevent React uncaught ErrorBoundary exception being
        printed to test output. */
        consoleSpy = jest.spyOn(console, 'error')
        consoleSpy.mockImplementation(() => {})
        sentrySpy = jest.spyOn(Sentry, 'captureMessage')
        const mockAxiosNetworkError = {
          request: {},
          response: {
            status: 500
          },
          message: 'Network Timeout'
        }
        mockedOptoutService.submitOptout.mockRejectedValue(
          mockAxiosNetworkError
        )
      })

      afterEach(() => {
        sentrySpy.mockRestore()
        consoleSpy.mockRestore()
      })

      it('should retry then log to Sentry if the request fails', async () => {
        setup()
        await waitForScreenToBeReady()

        enterOptoutAndSubmit(emailThatDoesNotCollectFeedback)

        // We automatically retry failing requests 2 times for a total of 3 requests.
        await waitFor(() => {
          expect(mockedOptoutService.submitOptout).toHaveBeenCalledTimes(3)
        })
        // Finally we log the total failure to sentry via `.captureMessage()`.
        expect(sentrySpy).toHaveBeenCalledWith(
          expect.stringMatching(/failed to complete request/i),
          expect.objectContaining({
            contexts: {
              'attempted optout': {
                key: optoutListKey,
                emailOptout: emailThatDoesNotCollectFeedback,
                smsOptout: '',
                campaignId: verifyKeySuccessResponse.campaignId,
                mailerId: verifyKeySuccessResponse.mailerId,
                cmaId: verifyKeySuccessResponse.cmaId
              }
            }
          })
        )
      })
    })
  })
})
