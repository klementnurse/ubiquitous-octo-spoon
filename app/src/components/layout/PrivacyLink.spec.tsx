import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as faker from 'faker'
import { CSSProperties } from 'react'
import { testRender } from '../../test'
import PrivacyLink from './PrivacyLink'

describe('<PrivacyLink />', () => {
  const defaultPrivacyContent = faker.random.words(10)

  interface SetupParams {
    content?: string
    link?: string
    style?: CSSProperties
  }

  const setup = ({
    content = defaultPrivacyContent,
    link,
    style
  }: SetupParams = {}) => {
    testRender(<PrivacyLink link={link} content={content} style={style} />)
  }

  describe('when the privacy link is clicked', () => {
    beforeEach(async () => {
      setup()
      const link = screen.getByRole('link')

      userEvent.click(link)

      // Wait for modal opening animation.
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })
    })

    it('should display a privacy policy modal', async () => {
      expect(screen.getByText(defaultPrivacyContent)).toBeInTheDocument()
    })

    it('should allow you to close the privacy policy modal', async () => {
      const closeButton = screen.getByRole('button', { name: 'Close' })

      userEvent.click(closeButton)

      // Wait for modal closing animation.
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull()
      })
    })
  })

  describe('when an external privacy URL is provided', () => {
    const externalLink = faker.internet.url()

    beforeEach(() => {
      setup({ link: externalLink })
    })

    it('should render a privacy link', () => {
      const link = screen.getByRole('link')

      expect(link).toHaveAttribute('href', externalLink)
    })
  })

  describe('when no content is provided', () => {
    beforeEach(() => {
      setup({ content: '' })
    })

    it('should not show a link', () => {
      const link = screen.queryByRole('link')

      expect(link).toBeNull()
    })
  })

  describe('when a custom link style is provided', () => {
    beforeEach(() => {
      setup({ style: { color: 'red' } })
    })

    it('should style the link', () => {
      const link = screen.getByRole('link')
      const styles = window.getComputedStyle(link)

      expect(styles.color).toBe('red')
    })
  })
})
