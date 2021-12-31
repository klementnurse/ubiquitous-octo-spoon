import { render } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory, MemoryHistory } from 'history'
import AppContextProvider, {
  AppContextInitialState,
  AppContextState
} from '../contexts/AppContext'

/**
 * Render test components with a AppContext state and router history.
 *
 * @param ui React component tree to test.
 * @param initialState AppContext state to be deep merged into defaultTestState.
 * @param initialHistory Memory router.
 * @param overrideContext Statically override parts the context. Useful for
 *                        state mocking setters.
 */
export const testRender = (
  ui: React.ReactElement,
  initialState?: AppContextInitialState,
  initialHistory?: MemoryHistory,
  overrideContext?: Partial<AppContextState>
) => {
  const history =
    initialHistory ||
    createMemoryHistory({
      initialEntries: ['/']
    })

  const reactElement = (
    <AppContextProvider initialState={initialState} override={overrideContext}>
      <Router history={history}>{ui}</Router>
    </AppContextProvider>
  )

  return {
    ...render(reactElement),
    reactElement,
    history
  }
}
