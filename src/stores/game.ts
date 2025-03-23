import { create } from 'zustand'
import { Game, GameTile } from '../types/game'

export type RackTile = [...GameTile, number | undefined]

interface GameStore {
  game: Game
  flatRack: Array<RackTile | undefined>
  setGame: (game: Game) => void
  dropFlatTile: (params: { tile: RackTile; playerId: number; index: number }) => void
  resetFlatRack: (params: { playerId: number }) => void
  sortTiles: (params: { playerId: number, tileSorter: GameTileSorter }) => void
}

export const initialColumns = 12
export const initialRows = 4
export const initialTiles: Array<RackTile | undefined> = Array.from(
  { length: initialColumns * initialRows },
)

export const useGameStore = create<GameStore>()(
  (set, get) => ({
    game: null as unknown as Game,
    rack: [],
    flatRack: [...initialTiles],
    setGame: (game) => {
      set({ 
        game, 
        flatRack: game.flat_rack_tiles.map(tile => tile != null ? [...tile, undefined] : undefined)
      })
    },
    dropFlatTile: ({
      tile, playerId, index
    }) => {
      const { game, flatRack } = get()
      if (game == null) {
        return
      }
      if (game.turn_id !== playerId) {
        return
      }
      const playerTiles = game.players.find(p => p.id === playerId)?.tiles
      const flatRackIndex = flatRack.findIndex(t => t?.[2] === tile[2])
      const isInFlatRack = flatRackIndex !== -1
      if (playerTiles == null || (!playerTiles.some(t => t[2] === tile[2]) && !isInFlatRack)) {
        console.error('Cant move selected tile')
        return
      }
      if (flatRack[index] != null) {
        console.error('Cannot drop tile', tile)
        return
      }
      const newFlatRack = [...flatRack]
      if (isInFlatRack) {
        newFlatRack[flatRackIndex] = undefined
      }
      newFlatRack[index] = tile
      const newPlayers = game.players.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            tiles: p.tiles.filter(t => t[2] !== tile[2])
          }
        }
        return p
      })
      set({
        flatRack: newFlatRack,
        game: {
          ...game,
          players: newPlayers
        }
      })
    },
    resetFlatRack: ({
      playerId
    }) => {
      const { game, flatRack } = get()
      if (game == null) {
        return
      }
      const playerTiles = game.players.find(p => p.id === playerId)?.tiles
      if (playerTiles == null) {
        return
      }
      const flatRackPlayerTiles = flatRack.filter(t => t != null && t[3] === playerId) as RackTile[]
      const newPlayerTiles = [...playerTiles, ...(flatRackPlayerTiles.map(t => [t[0], t[1], t[2]]) as GameTile[])]
      const newFlatRack = [...initialTiles]
      const newPlayers = game.players.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            tiles: newPlayerTiles
          }
        }
        return p
      })
      set({
        flatRack: newFlatRack,
        game: {
          ...game,
          players: newPlayers
        }
      })
    },
    sortTiles: ({
      playerId,
      tileSorter
    }) => {
      const { game } = get()
      if (game == null) {
        return
      }
      const playerTiles = game.players.find(p => p.id === playerId)?.tiles
      if (playerTiles == null) {
        return
      }
      const sortedTiles = [...playerTiles].sort(tileSorter)
      const newPlayers = game.players.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            tiles: sortedTiles
          }
        }
        return p
      })
      set({
        game: {
          ...game,
          players: newPlayers
        }
      })
    }
  }),
)

export type GameTileSorter = (a: GameTile, b: GameTile) => number

export function tileSorterByValue (a: GameTile, b: GameTile): number {
  return a[0] - b[0]
}

export function tileSorterByColor (a: GameTile, b: GameTile): number {
  return a[1].localeCompare(b[1])
}
