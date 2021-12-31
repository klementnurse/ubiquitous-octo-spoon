import { screen, waitFor } from '@testing-library/react'
import { createMemoryHistory, MemoryHistory } from 'history'
import * as faker from 'faker'
import { testRender, generateCampaignMailer, generatePageData } from '../test'
import * as LegacyService from '../services/legacy'
import * as OptoutService from '../services/optout'
import { AppContextInitialState } from '../contexts/AppContext'
import App from './App'

jest.mock('../services/legacy')
jest.mock('../services/optout')

const mockedLegacyService = LegacyService as unknown as jest.Mocked<
  typeof LegacyService
>

const mockedOptoutService = OptoutService as unknown as jest.Mocked<
  typeof OptoutService
>

const MAX_WORDS = 20

describe('<App />', () => {
  const optoutListKey = 'o-crlc-h92-0b8436ae30728c2840f52388ca6195e9'
  const verifyKeySuccessResponse = generateCampaignMailer({
    legacyKey: optoutListKey
  })
  const pageDataSuccessResponse = generatePageData({
    landing: {
      title: faker.random.words(MAX_WORDS),
      content: faker.random.words(MAX_WORDS),
      contentBelowEmail: false
    }
  })

  interface SetupParams {
    history?: MemoryHistory
    state?: AppContextInitialState
  }

  const setup = ({ history, state = {} }: SetupParams = {}) => {
    const testHistory =
      history ||
      createMemoryHistory({
        initialEntries: ['/']
      })

    testRender(<App />, state, testHistory)
  }

  beforeEach(() => {
    mockedLegacyService.verifyKey.mockResolvedValue(verifyKeySuccessResponse)
    mockedOptoutService.fetchPageData.mockResolvedValue(pageDataSuccessResponse)
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  describe('when the opt-out list key is valid', () => {
    it('should display the landing screen', async () => {
      const history = createMemoryHistory({
        initialEntries: [`/${optoutListKey}`]
      })
      setup({ history })

      await waitFor(() => {
        expect(screen.getByTestId('landing-form')).toBeInTheDocument()
      })
    })
  })

  describe('when an opt-out has been submitted', () => {
    it('should display the confirmation screen', async () => {
      const history = createMemoryHistory()
      // Confirmation page needs `location.state` defined.
      history.push('/confirmation', { email: faker.internet.email() })
      setup({ history })

      await waitFor(() => {
        expect(
          screen.getByText(/Successfully unsubscribed/i)
        ).toBeInTheDocument()
      })
    })
  })

  describe('when the opt-out list key is not valid', () => {
    beforeEach(() => {})

    it('should display the "not found" screen', () => {
      const history = createMemoryHistory({
        initialEntries: ['/blahblah']
      })
      setup({ history })

      expect(
        screen.getByText(/We could not find the right page./i)
      ).toBeInTheDocument()
    })
  })
})
