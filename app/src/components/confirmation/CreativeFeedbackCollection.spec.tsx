import { screen, waitFor } from '@testing-library/react'
import * as faker from 'faker'
import { testRender, generateCampaignMailer } from '../../test'
import * as LegacyService from '../../services/legacy'
import CreativeFeedbackCollection, {
  generateFeedbackForwardEmail
} from './CreativeFeedbackCollection'

jest.mock('../../services/legacy')

const mockedLegacyService = LegacyService as unknown as jest.Mocked<
  typeof LegacyService
>

describe('<CreativeFeedbackCollection />', () => {
  const optoutListKey = 'o-crlc-h92-0b8436ae30728c2840f52388ca6195e9'

  const setup = () => {
    const state = {
      campaignMailer: generateCampaignMailer({
        legacyKey: optoutListKey
      })
    }

    testRender(<CreativeFeedbackCollection />, state)
  }

  describe('when collection is not ready', () => {
    it('should not display the collection form', () => {
      mockedLegacyService.simpleToken.mockImplementation(async () => {
        return new Promise(() => {
          // Do nothing, collection will never be ready.
        })
      })
      setup()

      expect(screen.queryByTestId('creative-feedback-collection')).toBeNull()
    })
  })

  describe('when collection is ready', () => {
    const token = faker.datatype.uuid()

    it('should display the collection form', async () => {
      mockedLegacyService.simpleToken.mockResolvedValue(token)
      setup()

      await waitFor(() => {
        expect(
          screen.getByTestId('creative-feedback-collection')
        ).toBeInTheDocument()
      })

      const expectedForwardEmail = generateFeedbackForwardEmail(
        token,
        optoutListKey
      )

      await waitFor(() => {
        expect(mockedLegacyService.simpleToken).toHaveBeenCalled()
      })

      expect(
        screen.getByText(/Forwarding the email helps us/i)
      ).toBeInTheDocument()

      // No label so we can't use `getByLabelText()`.
      const forwardEmailInput = screen.getByTestId(
        'creative-feedback-collection__forward-email'
      )
      expect(forwardEmailInput).toHaveValue(expectedForwardEmail)
    })
  })
})
