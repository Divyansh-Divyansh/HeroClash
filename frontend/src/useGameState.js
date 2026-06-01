import { useState, useCallback } from 'react'
import { shuffle, getMostWinningStat } from './utils'
import { saveGame } from './api'

const STATS = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat']

export const useGameState = (allCards) => {
  const [gameState, setGameState] = useState('idle')
  const [playerHand, setPlayerHand] = useState([])
  const [cpuHand, setCpuHand] = useState([])
  const [playerPile, setPlayerPile] = useState([])
  const [cpuPile, setCpuPile] = useState([])
  const [roundResult, setRoundResult] = useState(null)
  const [selectedStat, setSelectedStat] = useState(null)
  const [statsUsed, setStatsUsed] = useState([])
  const [intelTokens, setIntelTokens] = useState(3)
  const [intelActive, setIntelActive] = useState(false)
  const [tiePot, setTiePot] = useState([])
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [cpuWeights, setCpuWeights] = useState(
    Object.fromEntries(STATS.map(s => [s, 1]))
  )

  // ── Start a new game ──
  const startGame = useCallback(() => {
    const shuffled = shuffle(allCards)
    setPlayerHand(shuffled.slice(0, 26))
    setCpuHand(shuffled.slice(26, 52))
    setPlayerPile([])
    setCpuPile([])
    setRoundResult(null)
    setSelectedStat(null)
    setStatsUsed([])
    setTiePot([])
    setIntelTokens(3)
    setIntelActive(false)
    setIsPlayerTurn(true)
    setCpuWeights(Object.fromEntries(STATS.map(s => [s, 1])))
    setGameState('playing')
  }, [allCards])

  // ── CPU picks a stat using adaptive weights ──
  const cpuPickStat = useCallback((weights) => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0)
    let rand = Math.random() * total
    for (const [stat, weight] of Object.entries(weights)) {
      rand -= weight
      if (rand <= 0) return stat
    }
    return STATS[0]
  }, [])

  // ── Update CPU weights after a round ──
  const updateCpuWeights = useCallback((stat, cpuWon) => {
    setCpuWeights(prev => {
      const updated = { ...prev }
      if (cpuWon) {
        updated[stat] = Math.min(updated[stat] + 0.3, 5) // reward
      } else {
        updated[stat] = Math.max(updated[stat] - 0.1, 0.1) // penalise
      }
      return updated
    })
  }, [])

  // ── Play a round ──
  const playRound = useCallback((chosenStat) => {
    if (gameState !== 'playing') return

    const playerCard = playerHand[0]
    const cpuCard = cpuHand[0]
    const playerValue = playerCard.stats[chosenStat]
    const cpuValue = cpuCard.stats[chosenStat]

    let winner = null
    if (playerValue > cpuValue) winner = 'player'
    else if (cpuValue > playerValue) winner = 'cpu'
    else winner = 'tie'

    setSelectedStat(chosenStat)
    setStatsUsed(prev => [...prev, chosenStat])
    updateCpuWeights(chosenStat, winner === 'cpu')

    setRoundResult({
      playerCard,
      cpuCard,
      chosenStat,
      playerValue,
      cpuValue,
      winner
    })
    setGameState('round_result')
  }, [gameState, playerHand, cpuHand, updateCpuWeights])

    // Resolve Round 
    const resolveRound = useCallback(() => {
      const { winner, playerCard, cpuCard, chosenStat } = roundResult

      let newPlayerHand = playerHand.slice(1)
      let newCpuHand = cpuHand.slice(1)
      let newPlayerPile = [...playerPile]
      let newCpuPile = [...cpuPile]
      let newTiePot = [...tiePot]

      // Move cards based on winner
      if (winner === 'player') {
        newPlayerPile = [...newPlayerPile, playerCard, cpuCard, ...newTiePot]
        newTiePot = []
      } else if (winner === 'cpu') {
        newCpuPile = [...newCpuPile, playerCard, cpuCard, ...newTiePot]
        newTiePot = []
      } else {
        // Tie — both cards go to pot
        newTiePot = [...newTiePot, playerCard, cpuCard]
      }

      // Reshuffle pile into hand when hand runs out
      if (newPlayerHand.length === 0 && newPlayerPile.length > 0) {
        newPlayerHand = shuffle(newPlayerPile)
        newPlayerPile = []
      }
      if (newCpuHand.length === 0 && newCpuPile.length > 0) {
        newCpuHand = shuffle(newCpuPile)
        newCpuPile = []
      }

      // Update all state
      setPlayerHand(newPlayerHand)
      setCpuHand(newCpuHand)
      setPlayerPile(newPlayerPile)
      setCpuPile(newCpuPile)
      setTiePot(newTiePot)
      setRoundResult(null)
      setSelectedStat(null)
      setIntelActive(false)

      // Build final stats for saving
      const finalStatsUsed = [...statsUsed, chosenStat]
      const statCounts = {}
      finalStatsUsed.forEach(s => {
        statCounts[s] = (statCounts[s] || 0) + 1
      })

      // Check win condition
      const playerLost = newPlayerHand.length === 0 && newPlayerPile.length === 0
      const cpuLost = newCpuHand.length === 0 && newCpuPile.length === 0

      if (cpuLost || playerLost) {
        const isPlayerWin = cpuLost

        saveGame({
          winner: isPlayerWin ? 'player' : 'cpu',
          total_rounds: finalStatsUsed.length,
          player_cards_won: newPlayerHand.length + newPlayerPile.length,
          cpu_cards_won: newCpuHand.length + newCpuPile.length,
          stats_used: statCounts,
          winning_stat: getMostWinningStat(finalStatsUsed)
        }).catch(err => console.error('Failed to save game:', err))

        setGameState('game_over')
        return
      }

      // Game continues — set next turn
      if (winner === 'player') {
        setIsPlayerTurn(true)
      } else if (winner === 'cpu') {
        setIsPlayerTurn(false)
      }

      setGameState('playing')

    }, [roundResult, playerHand, cpuHand, playerPile, cpuPile, tiePot, statsUsed])

  const totalPlayerCards = playerHand.length + playerPile.length
  const totalCpuCards = cpuHand.length + cpuPile.length
  const gameWinner = gameState === 'game_over'
    ? (totalPlayerCards > totalCpuCards ? 'player' : 'cpu')
    : null

  const useIntel = useCallback(() => {
  if (intelTokens <= 0) return
  setIntelActive(true)
  setIntelTokens(prev => prev - 1)
  }, [intelTokens])

  return {
    gameState,
    playerHand,
    cpuHand,
    playerPile,
    cpuPile,
    roundResult,
    selectedStat,
    statsUsed,
    cpuWeights,
    totalPlayerCards,
    totalCpuCards,
    gameWinner,
    startGame,
    playRound,
    resolveRound,
    cpuPickStat,
    intelTokens,
    intelActive,
    useIntel,
    isPlayerTurn,
    tiePot,
    winningStat: getMostWinningStat(statsUsed)
  }
}