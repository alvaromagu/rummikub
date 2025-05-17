import { Tile } from '../types/game'

export const UPDATE_CHANNEL = 'game-updated'
export const MAX_PLAYERS = 4
export const MIN_PLAYERS = 2
export const JOKER = 69
export const JOKER_FIXED_VALUE = 25
export const TILES_PER_COLOR = 13
export const INITAL_TILES_PER_PLAYER = 14
export const FIRST_MOVE_SCORE = 30

export const GAME_TILES: Tile[] = [
  ...(Array(TILES_PER_COLOR).fill(0).map((_, i) => [i + 1, 'red']) as Tile[]),
  ...(Array(TILES_PER_COLOR).fill(0).map((_, i) => [i + 1, 'red']) as Tile[]),
  ...(Array(TILES_PER_COLOR).fill(0).map((_, i) => [i + 1, 'blue']) as Tile[]),
  ...(Array(TILES_PER_COLOR).fill(0).map((_, i) => [i + 1, 'blue']) as Tile[]),
  ...(Array(TILES_PER_COLOR).fill(0).map((_, i) => [i + 1, 'black']) as Tile[]),
  ...(Array(TILES_PER_COLOR).fill(0).map((_, i) => [i + 1, 'black']) as Tile[]),
  ...(Array(TILES_PER_COLOR).fill(0).map((_, i) => [i + 1, 'yellow']) as Tile[]),
  ...(Array(TILES_PER_COLOR).fill(0).map((_, i) => [i + 1, 'yellow']) as Tile[]),
  [JOKER, 'red'],
  [JOKER, 'yellow']
]

export function getGameTiles (): Tile[] {
  return [...GAME_TILES]
}

export function randomArrIndex (length: number): number {
  return Math.floor(Math.random() * length)
}