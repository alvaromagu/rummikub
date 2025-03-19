import supabase from '../supabase/client'
import { GameTile } from '../types/game'
import { getGameTiles, INITAL_TILES_PER_PLAYER, MIN_PLAYERS, randomArrIndex } from '../utils/constants'
import { getGame } from './get-game'
import { initialTiles as initialFlatRackTiles } from '../stores/game'

export async function startGame({
  gameId
}: {
  gameId: number
}): Promise<{ error: boolean; }> {
  const game = await getGame({ id: gameId })
  if (game == null) {
    return { error: true }
  }
  const { id, players, started } = game
  if (started !== 'not_started') {
    return { error: true }
  }
  if (players.length < MIN_PLAYERS) {
    return { error: true }
  }
  const initialTiles = getGameTiles()
  const newGamePlayers = players.map(p => {
    const playerTiles: GameTile[] = []
    for (let i = 0; i < INITAL_TILES_PER_PLAYER; i++) {
      const randomIndex = randomArrIndex(initialTiles.length)
      const [tile] = initialTiles.splice(randomIndex, 1)
      playerTiles.push([...tile, crypto.randomUUID()])
    }
    return {...p, tiles: playerTiles}
  })
  const firstTurnIndex = Math.floor(Math.random() * players.length)
  const firstTurnPlayer = players[firstTurnIndex].id
  const {error} = await supabase
    .from('games')
    .update({
      players: newGamePlayers,
      started: 'started',
      turn_id: firstTurnPlayer,
      tiles_pool: initialTiles,
      flat_rack_tiles: [...initialFlatRackTiles] as []
    })
    .eq('id', id)
  if (error != null) {
    return { error: true }
  }
  return { error: false }
}