import { useLocation } from 'wouter'
import { Button } from '../components/button'
import { H1 } from '../components/h1'
import { Input } from '../components/input'
import { loginPlayer } from '../services/login-player'
import { useSessionStore } from '../stores/session'

type LoginForm = {
  name: string
}

export default function Login() {
  const [, navigate] = useLocation()
  const { setPlayer } = useSessionStore()

  return (
    <form
      className='flex flex-col gap-2'
      onSubmit={async event => {
        event.preventDefault()
        const formObj = Object.fromEntries(new FormData(event.target as HTMLFormElement)) as LoginForm
        const name = formObj.name?.trim()
        if (name == null || name === '') {
          return
        }
        const { data, error } = await loginPlayer({ name })
        if (error != null) {
          console.error(error)
          return
        }
        const { id } = data
        setPlayer({ id, name })
        navigate('/')
      }}
    >
      <H1>Login</H1>
      <Input name='name' placeholder='Name' required maxLength={50} />
      <Button type='submit'>Start Playing</Button>
    </form>
  )
}