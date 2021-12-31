import { useEffect } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import qs from 'qs'
import AppContextProvider from '../contexts/AppContext'
import AppLayout from './layout/AppLayout'
import Landing from './landing'
import NotFound from './common/NotFound'
import Confirmation from './confirmation/Confirmation'
import globalState from '../globalState'

const optoutKeyRegex = 'o-[a-zA-Z]+-\\w+-\\w+'

const App = () => {
  const location = useLocation()
  const query = qs.parse(location.search, { ignoreQueryPrefix: true })

  useEffect(() => {
    globalState.noCache = !!query.noCache
  }, [query.noCache])

  return (
    <AppContextProvider>
      <AppLayout>
        <Switch>
          <Route path={`/:legacyKey(${optoutKeyRegex})`} component={Landing} />

          <Route path={`/confirmation`} component={Confirmation} />

          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    </AppContextProvider>
  )
}

export default App
