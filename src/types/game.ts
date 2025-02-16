import { JOKER } from '../utils/constants'

export type TileValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | typeof JOKER

export type Tile = [TileValue, 'red' | 'blue' | 'black' | 'yellow']
export type GameTile = [...Tile, ReturnType<typeof crypto.randomUUID>]
export interface GamePlayer {
  id: number
  name: string
  tiles: GameTile[]
}

export type Game = {
  id: number
  players: GamePlayer[]
  rack_tiles: GameTile[][]
  tiles_pool: Tile[]
  started: GameStateEnum
  created_by: number
  turn_id: number | null
  winner_id: number | null
}

export type GameStateEnum = 'not_started' | 'started' | 'finished'
