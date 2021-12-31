import { screen } from '@testing-library/react'
import * as faker from 'faker'
import { Switch, Route } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { testRender } from '../../test'
import Confirmation from './Confirmation'

describe('<Confirmation />', () => {
  const { replace } = window.location
  const title = faker.random.words(10)
  const content = faker.random.words(10)
  const notFoundContent = faker.random.words(10)

  const setup = ({ email, sms, showAd, collectFeedback, state = {} } = {}) => {
    const contextState = {
      pageData: {
        confirmation: {
          title,
          content
        }
      },
      ...state
    }

    const history = createMemoryHistory({
      initialEntries: [
        {
          pathname: '/confirmation',
          state: { email, sms, showAd, collectFeedback }
        }
      ]
    })

    testRender(
      <Switch>
        <Route exact path='/confirmation'>
          <Confirmation />
        </Route>

        <Route path='/notfound'>
          <>{notFoundContent}</>
        </Route>
      </Switch>,
      contextState,
      history
    )
  }

  beforeEach(() => {
    // @see https://github.com/facebook/jest/issues/9471
    Object.defineProperty(window, 'location', { value: { replace: jest.fn() } })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: { replace } })
  })

  describe('when an email address is confirmed', () => {
    const email = faker.internet.email()

    beforeEach(() => {
      setup({ email })
    })

    it('should display a confirmation page title', () => {
      expect(screen.getByRole('heading', { name: title })).toBeInTheDocument()
    })

    it('should display a confirmation page content', () => {
      expect(screen.getByText(content)).toBeInTheDocument()
    })

    it('should display the unsubscribed email', () => {
      expect(screen.getByText(email)).toBeInTheDocument()
    })
  })

  describe('when the router state does not contain an optout (email or sms)', () => {
    beforeEach(() => {
      setup()
    })

    it('should redirect to the "not found" page', () => {
      expect(screen.getByText(notFoundContent)).toBeInTheDocument()
    })
  })

  describe('when showing an ad', () => {
    beforeEach(() => {
      setup({ email: faker.internet.email(), showAd: true })
    })

    it('should embed ads', () => {
      // Easier to add wrapper than mock out `<Advertisement /> dependencies.
      expect(
        screen.getByTestId('confirmation__advertisement')
      ).toBeInTheDocument()
    })
  })

  describe('when collecting creative feedback', () => {
    beforeEach(() => {
      setup({ email: faker.internet.email(), collectFeedback: true })
    })

    it('should display the creative feedback collection form', () => {
      // Easier to add wrapper than mock out `<CreativeFeedbackCollection /> dependencies.
      expect(
        screen.getByTestId('confirmation__creative-feedback-collection')
      ).toBeInTheDocument()
    })
  })

  describe('when redirecting to an ad', () => {
    const redirectUrlWithQueryParam = `${faker.internet.url()}?blah=test`
    const redirectUrlWithoutQueryParam = faker.internet.url()

    it('should redirect the user with sourceClientId when available', () => {
      setup({
        email: faker.internet.email(),
        showAd: true,
        state: {
          campaignMailer: {
            optoutAdRedirectUrl: redirectUrlWithoutQueryParam,
            sourceClientId: 2
          }
        }
      })

      const targetUrl = `${redirectUrlWithoutQueryParam}?utm_source=live&utm_medium=traffic&utm_campaign=one&sc=2`

      expect(window.location.replace).toHaveBeenCalledWith(targetUrl)
    })

    it('should redirect the user with targetClientId as well when available', () => {
      setup({
        email: faker.internet.email(),
        showAd: true,
        state: {
          campaignMailer: {
            optoutAdRedirectUrl: redirectUrlWithoutQueryParam,
            sourceClientId: 3,
            targetClientId: 33
          }
        }
      })

      const targetUrl = `${redirectUrlWithoutQueryParam}?utm_source=live&utm_medium=traffic&utm_campaign=one&sc=3&tc=33`

      expect(window.location.replace).toHaveBeenCalledWith(targetUrl)
    })

    it('should account for redirect URL with a query param', () => {
      setup({
        email: faker.internet.email(),
        showAd: true,
        state: {
          campaignMailer: {
            optoutAdRedirectUrl: redirectUrlWithQueryParam,
            sourceClientId: 4
          }
        }
      })

      const targetUrl = `${redirectUrlWithQueryParam}&utm_source=live&utm_medium=traffic&utm_campaign=one&sc=4`

      expect(window.location.replace).toHaveBeenCalledWith(targetUrl)
    })
  })
})
