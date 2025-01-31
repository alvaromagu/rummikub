import { Redirect } from 'wouter'

export function UnauthorizedRedirect () {
  return (
    <Redirect to={'/login'} />
  )
}