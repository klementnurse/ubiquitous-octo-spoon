import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as faker from 'faker'
import {
  testRender,
  generateCampaignMailer,
  generatePageData
} from '../../test'
import * as ComplaintService from '../../services/complaint'
import { AppContextInitialState } from '../../contexts/AppContext'
import ComplaintModal, {
  ComplaintModalProps,
  generateComplaintForwardEmail
} from './ComplaintModal'

jest.mock('../../services/complaint')

const mockedComplaintService = ComplaintService as unknown as jest.Mocked<
  typeof ComplaintService
>

describe('<ComplaintModal />', () => {
  const handleToggle = jest.fn()

  const setup = (
    { ...props }: Partial<ComplaintModalProps> = {},
    state: AppContextInitialState = {}
  ) => {
    const testState = {
      campaignMailer: generateCampaignMailer(),
      pageData: generatePageData(),
      ...state
    }

    testRender(
      <ComplaintModal isOpen={false} onToggle={handleToggle} {...props} />,
      testState
    )
  }

  const enterEmailAndSubmit = (email: string) => {
    const emailInput = screen.getByTestId('complaint-modal__email-input')
    const submitButton = screen.getByRole('button', {
      name: /Check Your Email/i
    })

    userEvent.type(emailInput, email)
    userEvent.click(submitButton)
  }

  describe("when the modal isn't open", () => {
    beforeEach(() => {
      setup()
    })

    it('should not display the modal', () => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  describe('when the modal is open', () => {
    beforeEach(() => {
      setup({ isOpen: true })
    })

    it('should display modal', async () => {
      // Wait for modal opening animation.
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })
  })

  describe('when checking an eligible email address', () => {
    const state = {
      campaignMailer: generateCampaignMailer()
    }
    const email = faker.internet.email()
    const token = faker.datatype.uuid()

    beforeEach(async () => {
      // We need a short delay to properly detect the loading state.
      mockedComplaintService.checkEligibility.mockImplementation(
        () =>
          new Promise(resolve => {
            return window.setTimeout(
              () =>
                resolve({
                  eligible: true,
                  token
                }),
              50
            )
          })
      )

      setup({ isOpen: true }, state)

      // Wait for modal opening animation.
      await waitFor(() => {
        screen.getByRole('dialog')
      })

      enterEmailAndSubmit(email)
    })

    it('should display an "email address eligible" message', async () => {
      expect(
        screen.getByRole('button', { name: 'Checking...' })
      ).toBeInTheDocument()

      await waitFor(() => {
        expect(mockedComplaintService.checkEligibility).toHaveBeenCalled()
      })

      // Loading indicator is done.
      expect(
        await screen.findByText(/Please proceed to the next step./i)
      ).toBeInTheDocument()
    })

    it('should display the "forward email" information', async () => {
      expect(
        screen.getByRole('button', { name: 'Checking...' })
      ).toBeInTheDocument()

      const expectedForwardEmail = generateComplaintForwardEmail(
        token,
        email,
        state.campaignMailer.legacyKey
      )

      expect(
        await screen.findByText(
          /Please forward a copy of the email you received/i
        )
      ).toBeInTheDocument()

      // No label so we can't use `getByLabelText()`.
      const forwardEmailInput = screen.getByTestId(
        'complaint-modal__forward-email'
      )
      expect(forwardEmailInput).toHaveValue(expectedForwardEmail)
    })
  })

  describe('when checking an ineligible email address', () => {
    const state = {
      campaignMailer: generateCampaignMailer()
    }
    const email = faker.internet.email()
    const reason = faker.random.words(10)

    it('should display a reason the email address is not eligible', async () => {
      mockedComplaintService.checkEligibility.mockResolvedValue({
        eligible: false,
        reason
      })
      setup({ isOpen: true }, state)

      // Wait for modal opening animation.
      await waitFor(() => {
        screen.getByRole('dialog')
      })

      enterEmailAndSubmit(email)

      // Loading indicator has started.
      expect(
        screen.getByRole('button', { name: 'Checking...' })
      ).toBeInTheDocument()

      await waitFor(() => {
        expect(mockedComplaintService.checkEligibility).toHaveBeenCalled()
      })

      expect(await screen.findByText(reason)).toBeInTheDocument()

      expect(
        screen.queryByText(/Please forward a copy of the email you received/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('when checking an invalid email address', () => {
    const invalidEmailAddress = 'drongo.com'

    beforeEach(async () => {
      setup({ isOpen: true })

      // Wait for modal opening animation.
      await waitFor(() => {
        screen.getByRole('dialog')
      })

      const emailInput = screen.getByTestId('complaint-modal__email-input')
      const submitButton = screen.getByRole('button', {
        name: /Check Your Email/i
      })

      userEvent.type(emailInput, invalidEmailAddress)
      userEvent.click(submitButton)
    })

    it('should display an error message', () => {
      expect(
        screen.getByText(/Please enter a valid email address./i)
      ).toBeInTheDocument()
    })
  })
})
