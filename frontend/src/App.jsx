import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchDeck } from './api'
import { useGameState } from './useGameState'
import GameBoard from './GameBoard'
import GameOver from './GameOver'

export default function App() {
  const [allCards, setAllCards] = useState([])
  const [loading, setLoading] = useState(true)
  const game = useGameState(allCards)

  useEffect(() => {
    fetchDeck().then(data => {
      setAllCards(data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#0a0a0f' }}>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-center"
      >
        <div className="text-5xl mb-4">⚡</div>
        <p className="text-gray-400 text-lg tracking-widest uppercase"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Loading Heroes...
        </p>
      </motion.div>
    </div>
  )

return (
  <div className="min-h-screen text-white py-8 px-4"
    style={{ 
      backgroundImage: 'url(/bg.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
    
    {/* Dark overlay */}
    <div className="fixed inset-0 bg-black/40 z-0" />
    
    {/* ALL content inside here */}
    <div className="relative z-10">

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <img
          src="/logo.png"
          alt="HeroClash"
          style={{
            height: '300px',
            margin: '0 auto',
            filter: 'drop-shadow(0 0 20px rgba(255,100,100,0.4)) drop-shadow(0 0 20px rgba(100,100,255,0.4))'
          }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        {game.gameState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 mt-16"
          >
            <div className="text-center space-y-3">
              <p className="text-gray-300 text-lg">52 heroes. 6 stats. One winner.</p>
              <p className="text-gray-500 text-sm max-w-sm">
                Pick your best stat each round. Beat the CPU's card to win both. 
                Collect all 52 cards to win.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={game.startGame}
              className="px-16 py-5 rounded-2xl font-black text-2xl text-black"
              style={{
                background: 'linear-gradient(135deg, #FBB624, #F59E0B)',
                fontFamily: "'Bebas Neue', sans-serif",
                letterSpacing: '0.1em',
                boxShadow: '0 0 40px rgba(251,191,36,0.3)'
              }}
            >
              START BATTLE
            </motion.button>
          </motion.div>
        )}

        {(game.gameState === 'playing' || game.gameState === 'round_result') && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameBoard game={game} allCards={allCards} />
          </motion.div>
        )}

        {game.gameState === 'game_over' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameOver
              winner={game.gameWinner}
              statsUsed={game.statsUsed}
              winningStat={game.winningStat}
              onPlayAgain={game.startGame}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div> 
  </div> 
)
}