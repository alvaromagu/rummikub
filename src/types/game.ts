import { JOKER } from '../utils/constants'

export type TileValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | typeof JOKER
export type Tile = [TileValue, 'red' | 'blue' | 'black' | 'yellow']
export interface GamePlayer {
  id: number
  name: string
  tiles: Tile[]
}

export type Game = {
  id: number
  players: GamePlayer[]
  tiles_pool: Tile[]
  started: boolean
  created_by: number
  turn_id: number | null
}