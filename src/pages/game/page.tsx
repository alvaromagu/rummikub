import { Redirect, useParams } from 'wouter'
import { H1 } from '../../components/h1'
import { UnauthorizedRedirect } from '../../components/unauthorized-redirect'
import { useSessionStore } from '../../stores/session'
import { Board } from './board'

export default function Game() {
  const { player } = useSessionStore()
  const { id: pathId } = useParams<{ id: string }>()

  if (player == null) {
    return <UnauthorizedRedirect />
  }

  const id = Math.floor(Number(pathId))

  if (isNaN(id)) {
    return <Redirect to={'/'} />
  }

  return (
    <div className='flex-1 flex flex-col gap-2'>
      <H1 className='text-center'>Game:{id}</H1>
      <Board id={id} />
    </div>
  )
}
