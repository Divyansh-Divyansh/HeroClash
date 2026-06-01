// Shuffle an array randomly
export const shuffle = (array) => {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Calculate win probability for a stat
// Based on how the player's value compares to all 52 cards
export const calcWinProbability = (playerValue, stat, allCards) => {
  const allValues = allCards.map(c => c.stats[stat])
  const winsAgainst = allValues.filter(v => playerValue > v).length
  return Math.round((winsAgainst / allValues.length) * 100)
}

// Get the stat that won the most rounds
export const getMostWinningStat = (statsUsed) => {
  if (!statsUsed || statsUsed.length === 0) return null
  const counts = {}
  statsUsed.forEach(s => {
    counts[s] = (counts[s] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

// Get composite power score for a card
export const getPowerScore = (card) => {
  const stats = Object.values(card.stats)
  return Math.round(stats.reduce((a, b) => a + b, 0) / stats.length)
}