import { motion } from 'framer-motion'

export default function GameOver({ winner, statsUsed, winningStat, onPlayAgain }) {
  const isPlayerWin = winner === 'player'

  const statCounts = {}
  statsUsed.forEach(s => { statCounts[s] = (statCounts[s] || 0) + 1 })
  const sortedStats = Object.entries(statCounts).sort((a, b) => b[1] - a[1])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-8 text-center"
    >
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <div className="text-8xl mb-4">
          {isPlayerWin ? '🏆' : '💀'}
        </div>
        <h1 className="text-6xl font-black"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            color: isPlayerWin ? '#FBB F24' : '#EF4444',
            letterSpacing: '0.05em'
          }}>
          {isPlayerWin ? 'VICTORY!' : 'DEFEATED!'}
        </h1>
        <p className="text-gray-400 text-lg mt-2">
          {isPlayerWin ? 'You collected all 52 cards!' : 'The CPU dominated you!'}
        </p>
      </motion.div>

      {/* Game stats */}
      <div className="bg-white/5 rounded-2xl p-6 w-full max-w-sm border border-white/10">
        <h3 className="text-lg font-bold text-gray-300 mb-4">Game Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Rounds</span>
            <span className="font-bold text-white">{statsUsed.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Most Used Stat</span>
            <span className="font-bold text-yellow-400 capitalize">{winningStat || '—'}</span>
          </div>
          {sortedStats.slice(0, 3).map(([stat, count]) => (
            <div key={stat} className="flex justify-between text-sm">
              <span className="text-gray-500 capitalize">{stat}</span>
              <span className="text-gray-300">{count} times</span>
            </div>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onPlayAgain}
        className="px-12 py-4 rounded-2xl font-black text-xl text-black"
        style={{
          background: 'linear-gradient(135deg, #FBB F24, #F59E0B)',
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: '0.1em'
        }}
      >
        PLAY AGAIN
      </motion.button>
    </motion.div>
  )
}