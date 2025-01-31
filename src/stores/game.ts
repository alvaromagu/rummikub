import { create } from 'zustand'
import { Game, GameTile } from '../types/game'

type RackTile = [...GameTile, number | undefined]

interface GameStore {
  game: Game | null
  rack: RackTile[][]
  setGame: (game: Game) => void
  dropTile: (params: { tile: GameTile; playerId: number; subrackIndex?: number }) => void
  resetRack: (params: { playerId: number }) => void
}

export const useGameStore = create<GameStore>()(
  (set, get) => ({
    game: null,
    rack: [],
    setGame: (game) => { 
      set({ game, rack: game.rack_tiles.map(tiles => tiles.map(tile => [...tile, undefined])) })
    },
    dropTile: ({
      tile, playerId, subrackIndex
    }) => {
      const { rack, game } = get()
      if (game == null) {
        return
      }
      if (game.turn_id !== playerId) {
        return
      }
      const playerTiles = game.players.find(p => p.id === playerId)?.tiles
      if (playerTiles == null || !playerTiles.some(t => t[2] === tile[2])) {
        return
      }
      const alreadyInRack = rack.some(tiles => tiles.some(([, , id]) => id === tile[2]))
      if (alreadyInRack) {
        return
      }
      const rackTile: RackTile = [...tile, playerId]
      const newRack = [...rack]
      if (subrackIndex != null) {
        newRack[subrackIndex]?.push(rackTile)
      } else {
        newRack.push([rackTile])
      }
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
        rack: newRack.filter(tiles => tiles.length > 0),
        game: {
          ...game,
          players: newPlayers
        }
      })
    },
    resetRack: ({
      playerId
    }: {
      playerId: number
    }) => {
      const { game, rack } = get()
      if (game == null) {
        return
      }
      const playerTiles = game.players.find(p => p.id === playerId)?.tiles
      if (playerTiles == null) {
        return
      }
      const rackPlayerTiles = rack.flatMap(tiles => tiles.filter(([, , , id]) => id === playerId))
      const newPlayerTiles = [...playerTiles, ...(rackPlayerTiles.map(t => [t[0], t[1], t[2]]) as GameTile[])]
      const newRack = rack.map(tiles => tiles.filter(([, , , id]) => id === undefined))
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
        rack: newRack.filter(tiles => tiles.length > 0),
        game: {
          ...game,
          players: newPlayers
        }
      })
    }
  })
)