import { ReactNode } from 'react'
import { Link } from './link'
import { useSessionStore } from '../stores/session'
import { Button } from './button'

export function Layout({
  children
}: {
  children: ReactNode
}) {
  const { player, logout } = useSessionStore()

  return (
    <div className='flex flex-col h-dvh max-w-2xl mx-auto'>
      <header>
        <nav className='flex justify-center gap-2 border-b'>
          <Link href='/'>Home</Link>
          {player == null && <Link href='/login'>Login</Link>}
          {player != null && (
            <Button 
              onClick={logout} 
              className='transition-colors hover:text-cyan-600 p-0 bg-transparent hover:bg-transparent'
            >
              {player.name}:Logout
            </Button>
          )}
        </nav>
      </header>
      <main className='flex-1 p-2 flex flex-col'>
        {children}
      </main>
    </div>
  )
}