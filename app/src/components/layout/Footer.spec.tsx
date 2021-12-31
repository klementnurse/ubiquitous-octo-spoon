import { screen } from '@testing-library/react'
import * as faker from 'faker'
import Footer from './Footer'
import { testRender } from '../../test'
import { OptoutType } from '../../contracts'

describe('<Footer />', () => {
  const setup = (state = {}) => {
    testRender(<Footer />, state)
  }

  describe('when page data is not available', () => {
    const state = { pageData: null }

    beforeEach(() => {
      setup(state)
    })

    it('should not show a privacy policy link', () => {
      const privacyLink = screen.queryByRole('link', { name: 'Privacy' })

      expect(privacyLink).toBeNull()
    })

    it('should not show a complaints link', () => {
      const complaintLink = screen.queryByRole('link', {
        name: /Still receiving email after unsubscribing?/i
      })

      expect(complaintLink).toBeNull()
    })
  })

  describe('when page data is available', () => {
    // Minimum state required for the footer links to display.
    const state = {
      campaignMailer: {
        campaignId: faker.datatype.uuid(),
        optoutType: OptoutType.Email
      },
      pageData: {
        privacy: {
          url: faker.internet.url(),
          content: faker.random.words(10)
        },
        style: {
          footer: '',
          footerLinkStyle: ''
        }
      }
    }

    beforeEach(() => {
      setup(state)
    })

    it('should show a privacy policy link', () => {
      const privacyLink = screen.getByRole('link', { name: 'Privacy' })

      expect(privacyLink).toBeInTheDocument()
    })

    it('should show a complaints link', () => {
      const complaintLink = screen.getByRole('button', {
        name: /Still receiving email after unsubscribing?/i
      })

      expect(complaintLink).toBeInTheDocument()
    })
  })

  describe('when custom styling is provided', () => {
    const state = {
      pageData: {
        privacy: {
          url: faker.internet.url(),
          content: faker.random.words(10)
        },
        style: {
          footer: 'background-color: red;',
          'footer-a': 'color: red'
        }
      }
    }

    beforeEach(() => {
      setup(state)
    })

    it('should style the footer', () => {
      const footer = screen.getByTestId('footer')
      const styles = window.getComputedStyle(footer)

      expect(styles.backgroundColor).toBe('red')
    })

    it('should style the footer links', () => {
      const privacyLink = screen.getByRole('link', { name: 'Privacy' })
      const styles = window.getComputedStyle(privacyLink)

      expect(styles.color).toBe('red')
    })
  })
})
