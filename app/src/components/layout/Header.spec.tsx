import { screen } from '@testing-library/react'
import Header, { optoutLogoStoragePath } from './Header'
import { testRender } from '../../test'

describe('<Header />', () => {
  const testLogoAbsolutePath =
    'https://client.optizmo.net/media/img/new_logo_small.png'

  const setup = (state = {}) => {
    testRender(<Header />, state)
  }

  describe('when custom header styling is provided', () => {
    beforeEach(() => {
      setup({
        pageData: {
          logo: testLogoAbsolutePath,
          style: {
            header: 'background-color: red;'
          }
        }
      })
    })

    it('should style the link', () => {
      const header = screen.getByTestId('header')
      const styles = window.getComputedStyle(header)

      expect(styles.backgroundColor).toBe('red')
    })
  })

  describe('when the logo has an absolute path', () => {
    beforeEach(() => {
      setup({
        pageData: {
          logo: testLogoAbsolutePath,
          style: {
            header: 'background-color: red;'
          }
        }
      })
    })

    it('should display the logo', () => {
      const logo = screen.getByRole('img')

      expect(logo).toHaveAttribute('src', testLogoAbsolutePath)
    })
  })

  describe('when the logo has a relative path', () => {
    const logoImage = 'test.png'
    const expectedLogoPath = `${optoutLogoStoragePath}${logoImage}`

    beforeEach(() => {
      setup({
        pageData: {
          logo: 'test.png',
          style: {
            header: 'background-color: red;'
          }
        }
      })
    })

    it('should display the logo', () => {
      const logo = screen.getByRole('img')

      expect(logo).toHaveAttribute('src', expectedLogoPath)
    })
  })
})
