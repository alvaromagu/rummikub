import { lazy, Suspense } from 'react'
import { Route, Switch } from 'wouter'
import { Layout } from './components/layout'

const lazyGame = lazy(() => import('./pages/game'))
const lazyHome = lazy(() => import('./pages/home'))
const lazyLogin = lazy(() => import('./pages/login'))

function App() {
  return (
    <Layout>
      <Suspense>
        <Switch>
          <Route path={'/game/:id'} component={lazyGame} />
          <Route path={'/login'} component={lazyLogin} />
          <Route path={'/*'} component={lazyHome} />
        </Switch>
      </Suspense>
    </Layout>
  )
}

export default App
