import { motion } from 'framer-motion'

export default function ScoreBar({ playerCards, cpuCards }) {
  const total = playerCards + cpuCards
  const playerPct = total > 0 ? (playerCards / total) * 100 : 50

  return (
    <div className="w-full max-w-lg mx-auto mb-8">
      <div className="flex justify-between text-sm font-bold mb-2">
        <span className="text-green-400">YOU — {playerCards} cards</span>
        <span className="text-red-400">CPU — {cpuCards} cards</span>
      </div>
      <div className="h-4 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.1)' }}>
        <motion.div
          animate={{ width: `${playerPct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #10B981, #3B82F6)' }}
        />
      </div>
    </div>
  )
}