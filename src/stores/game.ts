import { create } from 'zustand'
import { Game } from '../types/game'

interface GameStore {
  game: Game | null
  setGame: (game: Game) => void
}

export const useGameStore = create<GameStore>()(
  (set) => ({
    game: null,
    setGame: (game) => { set({ game }) }
  })
)