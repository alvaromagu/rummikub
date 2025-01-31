import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Player } from '../types/player'

interface SessionStore {
  player: Player | null
  setPlayer: (user: Player) => void
  logout: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      player: null,
      setPlayer: (user) => { 
        set({ player: user })
      },
      logout: () => { 
        set({ player: null }) 
      },
    }), {
      name: 'player-session',
    }
  )
)