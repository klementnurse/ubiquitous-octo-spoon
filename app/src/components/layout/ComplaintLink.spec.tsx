import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppContextInitialState } from '../../contexts/AppContext'
import {
  testRender,
  generateCampaignMailer,
  generatePageData
} from '../../test'
import ComplaintLink, { ComplaintLinkProps } from './ComplaintLink'

describe('<ComplaintLink />', () => {
  const setup = (
    { style }: ComplaintLinkProps = {},
    state: AppContextInitialState = {}
  ) => {
    testRender(<ComplaintLink style={style} />, state)
  }

  describe('when page data is not available', () => {
    const state = { pageData: undefined }

    beforeEach(() => {
      setup({}, state)
    })

    it('should not show a complaint link', () => {
      const complaintLink = screen.queryByRole('button', {
        name: /Still receiving email after unsubscribing?/i
      })

      expect(complaintLink).toBeNull()
    })
  })

  describe('when page data is available', () => {
    // Minimum state required for the complaint link to display.
    const state = {
      campaignMailer: generateCampaignMailer(),
      pageData: generatePageData()
    }

    beforeEach(() => {
      setup({}, state)
    })

    it('should show a complaint link', () => {
      const complaintLink = screen.getByRole('button', {
        name: /Still receiving email after unsubscribing?/i
      })
      expect(complaintLink).toBeInTheDocument()
    })

    describe('when the complaint link is clicked', () => {
      beforeEach(async () => {
        const complaintLink = screen.getByRole('button', {
          name: /Still receiving email after unsubscribing?/i
        })
        userEvent.click(complaintLink)

        // Wait for modal opening animation.
        await waitFor(() => {
          screen.getByRole('dialog')
        })
      })

      it('should display the complaint modal', async () => {
        const heading = screen.getByRole('heading', {
          name: /Still receiving emails after unsubscribing?/i
        })
        expect(heading).toBeInTheDocument()
      })

      it('should allow you to close the complaint form modal', async () => {
        const closeButton = screen.getByRole('button', { name: 'Close' })

        userEvent.click(closeButton)

        // Wait for modal closing animation.
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).toBeNull()
        })
      })
    })
  })

  describe('when a custom link style is provided', () => {
    // Minimum state required for the complaint link to display.
    const state = {
      campaignMailer: generateCampaignMailer(),
      pageData: generatePageData()
    }

    beforeEach(() => {
      setup({ style: { color: 'red' } }, state)
    })

    it('should style the link', () => {
      const complaintLink = screen.getByRole('button', {
        name: /Still receiving email after unsubscribing?/i
      })
      const styles = window.getComputedStyle(complaintLink)

      expect(styles.color).toBe('red')
    })
  })
})
