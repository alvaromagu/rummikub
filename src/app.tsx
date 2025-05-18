import { lazy, Suspense } from 'react'
import { Route, Switch } from 'wouter'
import { Layout } from './components/layout'
import { Providers } from './components/providers'

const lazyGame = lazy(() => import('./pages/game/page'))
const lazyHome = lazy(() => import('./pages/home'))
const lazyLogin = lazy(() => import('./pages/login'))

function App() {
  return (
    <Providers>
      <Layout>
        <Suspense>
          <Switch>
            <Route path={'/game/:id'} component={lazyGame} />
            <Route path={'/login'} component={lazyLogin} />
            <Route path={'/*'} component={lazyHome} />
          </Switch>
        </Suspense>
      </Layout>
    </Providers>
  )
}

export default App
