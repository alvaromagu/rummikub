import { create } from 'zustand'
import { Game, GameTile } from '../types/game'
import { increaseRackSize, initialTiles, isRackCompact } from '../utils/grid'
import { ServiceError } from '../types/error'

export type RackTile = [...GameTile, number | undefined]

interface GameStore {
  game: Game
  flatRack: Array<RackTile | undefined>
  setGame: (params: { game: Game, playerId: number | undefined }) => void
  dropFlatTile: (params: { tile: RackTile; playerId: number; index: number }) => ServiceError
  resetFlatRack: (params: { playerId: number }) => ServiceError
  sortTiles: (params: { playerId: number, tileSorter: GameTileSorter }) => ServiceError
  stateDrawTile: (params: { playerId: number, tile: GameTile }) => void
}

export const useGameStore = create<GameStore>()(
  (set, get) => ({
    game: null as unknown as Game,
    rack: [],
    flatRack: [...initialTiles],
    setGame: ({ game, playerId }) => {
      if (game == null) {
        return game
      }
      const prevState = get()
      set({
        game: prevState.game == null ? game : {
          ...game,
          players: game.players.map(player => {
            if (player.id === playerId) {
              const statePlayer = prevState.game.players.find(p => p.id === playerId)
              if (statePlayer != null) {
                return {
                  ...player,
                  tiles: statePlayer.tiles
                }
              }
            }
            return player
          })
        },
        flatRack: game.flat_rack_tiles.map(tile => tile != null ? [...tile, undefined] : undefined)
      })
    },
    dropFlatTile: ({
      tile, playerId, index
    }): ServiceError => {
      const { game, flatRack } = get()
      if (game == null) {
        return { error: true, message: 'Game not found' }
      }
      if (game.turn_id !== playerId) {
        return { error: true, message: 'Not your turn' }
      }
      const playerTiles = game.players.find(p => p.id === playerId)?.tiles
      const flatRackIndex = flatRack.findIndex(t => t?.[2] === tile[2])
      const isInFlatRack = flatRackIndex !== -1
      if (playerTiles == null || (!playerTiles.some(t => t[2] === tile[2]) && !isInFlatRack)) {
        console.error('Cant move selected tile')
        return { error: true, message: 'Cant move selected tile' }
      }
      if (flatRack[index] != null) {
        console.error('Cannot drop tile', tile)
        return { error: true, message: 'Cannot drop tile' }
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
        flatRack: isRackCompact({ rackTiles: newFlatRack }) ? increaseRackSize({ flatRack: newFlatRack }) : newFlatRack,
        game: {
          ...game,
          players: newPlayers
        }
      })
      return { error: false }
    },
    resetFlatRack: ({
      playerId
    }): ServiceError => {
      const { game, flatRack } = get()
      if (game == null) {
        return { error: true, message: 'Game not found' }
      }
      const playerTiles = game.players.find(p => p.id === playerId)?.tiles
      if (playerTiles == null) {
        return { error: true, message: 'Player not found' }
      }
      const flatRackPlayerTiles = flatRack.filter(t => t != null && t[3] === playerId) as RackTile[]
      const newPlayerTiles = [...playerTiles, ...(flatRackPlayerTiles.map(t => [t[0], t[1], t[2]]) as GameTile[])]
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
        flatRack: game.flat_rack_tiles.map(tile => tile != null ? [...tile, undefined] : undefined),
        game: {
          ...game,
          players: newPlayers
        }
      })
      return { error: false }
    },
    sortTiles: ({
      playerId,
      tileSorter
    }): ServiceError => {
      const { game } = get()
      if (game == null) {
        return { error: true, message: 'Game not found' }
      }
      const playerTiles = game.players.find(p => p.id === playerId)?.tiles
      if (playerTiles == null) {
        return { error: true, message: 'Player not found' }
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
      return { error: false }
    },
    stateDrawTile: ({ playerId, tile }) => {
      const { game } = get()
      if (game == null) {
        return
      }
      const playerTiles = game.players.find(p => p.id === playerId)?.tiles
      if (playerTiles == null) {
        return
      }
      const newPlayerTiles = [...playerTiles, tile]
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
        game: {
          ...game,
          players: newPlayers
        }
      })
    }
  }),
)

export type GameTileSorter = (a: GameTile, b: GameTile) => number

export function tileSorterByValue(a: GameTile, b: GameTile): number {
  return a[0] - b[0]
}

export function tileSorterByColor(a: GameTile, b: GameTile): number {
  return a[1].localeCompare(b[1])
}
