import { create } from 'zustand'
import { Game, GameTile } from '../types/game'
import { JOKER } from '../utils/constants'

export type RackTile = [...GameTile, number | undefined]

interface GameStore {
  game: Game
  rack: RackTile[][]
  setGame: (game: Game) => void
  dropTile: (params: { tile: RackTile; playerId: number; subrackIndex?: number }) => void
  resetRack: (params: { playerId: number }) => void
  sortTiles: (params: { playerId: number, tileSorter: GameTileSorter }) => void
}

export const useGameStore = create<GameStore>()(
  (set, get) => ({
    game: null as unknown as Game,
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
      const alreadyDropped = rack.some(tiles => tiles.some(t => t[2] === tile[2]))
      if (playerTiles == null || (!playerTiles.some(t => t[2] === tile[2]) && !alreadyDropped)) {
        console.error('Player does not have this tile')
        return
      }
      const rackTile: RackTile = [...tile]
      const newPlayers = game.players.map(p => {
        if (p.id === playerId) {
          return {
            ...p,
            tiles: p.tiles.filter(t => t[2] !== tile[2])
          }
        }
        return p
      })
      const filterFromRack = rack.map(tiles => tiles.filter(t => t[2] !== tile[2])).filter(tiles => tiles.length > 0)
      const newRack = [...filterFromRack]
      if (subrackIndex == null) {
        newRack.push([rackTile])
        set({
          rack: newRack,
          game: {
            ...game,
            players: newPlayers
          }
        })
        return
      }
      const subrack = newRack[subrackIndex]
      if (subrack == null) {
        return
      }
      if (tile[0] === JOKER) {
        subrack.push(rackTile)
        set({
          rack: newRack.filter(tiles => tiles.length > 0),
          game: {
            ...game,
            players: newPlayers
          }
        })
        return
      }
      const isSameNumber = subrack.filter(([value]) => value !== JOKER).every(t => t[0] === tile[0])
      if (isSameNumber) {
        const isColorInUse = subrack.filter(([value]) => value !== JOKER).some(t => t[1] === tile[1])
        if (isColorInUse) {
          newRack.push([rackTile])
        } else {
          subrack.push(rackTile)
        }
        set({
          rack: newRack.filter(tiles => tiles.length > 0),
          game: {
            ...game,
            players: newPlayers
          }
        })
        return
      }
      const isSameColor = subrack.filter(([value]) => value !== JOKER).every(t => t[1] === tile[1])
      if (!isSameColor) {
        newRack.push([rackTile])
        set({
          rack: [...newRack.filter(tiles => tiles.length > 0)],
          game: {
            ...game,
            players: newPlayers
          }
        })
        return
      }
      const stairPosition = getSubrackStairPosition({subrack, tile: rackTile})
      if (stairPosition == null) {
        newRack.push([rackTile])
        set({
          rack: newRack.filter(tiles => tiles.length > 0),
          game: {
            ...game,
            players: newPlayers
          }
        })
        return
      }
      subrack.splice(stairPosition, 0, rackTile)
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


function getSubrackStairPosition ({subrack, tile}: {subrack: RackTile[]; tile: RackTile}): number | undefined {
  // method to get posible postion of tile in stair subrack
  // return position of stair
  // return undefined if tile is not in stair
  const stair = subrack.map(t => t[0])
  const tileValue = tile[0]
  const isValueInStair = stair.some(step => step === tileValue)
  if (isValueInStair) {
    return undefined
  }
  const nextValueIndex = stair.findIndex(step => step === tileValue + 1)
  if (nextValueIndex !== -1) {
    return nextValueIndex
  }
  const previousValueIndex = stair.findIndex(step => step === tileValue - 1)
  if (previousValueIndex !== -1) {
    return previousValueIndex + 1
  }
  // check if can be placed with jokers
  for (let i = 0; i < stair.length; i++) {
    const step = stair[i]
    if (step !== JOKER) {
      continue
    }
    const nextStep = stair[i + 1]
    const prevStep = stair[i - 1]
    if (nextStep === tileValue + 2) {
      return i
    }
    if (prevStep === tileValue - 2) {
      return i + 1
    }
  }
  return undefined
}
