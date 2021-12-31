import { screen } from '@testing-library/react'
import * as faker from 'faker'
import { testRender } from '../../test'
import AppLayout from './AppLayout'

describe('<AppLayout />', () => {
  const setup = ({ children }, state = {}) => {
    testRender(<AppLayout>{children}</AppLayout>, state)
  }

  describe('when custom styling is provided', () => {
    const content = faker.random.words(10)
    const state = {
      pageData: {
        privacy: {
          url: faker.internet.url(),
          content: faker.random.words(10)
        },
        style: {
          body: 'color: red; background-color: red;',
          container: 'color: green; background-color: green;',
          content: 'color: blue; background-color: blue;'
        }
      }
    }

    beforeEach(() => {
      setup({ children: content }, state)
    })

    it('should style the document body', async () => {
      expect(document.body.style.color).toBe('red')
    })

    it('should style the container', () => {
      const appLayout = screen.getByTestId('app-layout')
      const styles = window.getComputedStyle(appLayout)

      expect(styles.backgroundColor).toBe('green')
    })

    it('should style the content', () => {
      const appContent = screen.getByText(content)
      const styles = window.getComputedStyle(appContent)

      expect(styles.color).toBe('blue')
    })
  })
})
