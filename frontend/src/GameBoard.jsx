import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import HeroCard from './HeroCard'
import ScoreBar from './ScoreBar'

export default function GameBoard({ game, allCards }) {
  const { 
    gameState, playerHand, cpuHand, 
    roundResult, selectedStat,
    totalPlayerCards, totalCpuCards,
    playRound, resolveRound, cpuPickStat, cpuWeights,
    tiePot
  } = game

  const playerCard = playerHand[0]
  const cpuCard = cpuHand[0]
  const isRoundResult = gameState === 'round_result'

   // Determine whose turn it is based on total cards
  // CPU goes first every other round (when CPU has fewer cards — they're hungry!)
  // Simple rule: CPU picks when round number is even
  //const roundNumber = game.statsUsed.length
  const isCpuTurn = gameState === 'playing' && !game.isPlayerTurn

  useEffect(() => {
    if (!isCpuTurn) return
    if (!cpuCard) return

    // CPU thinks for 1.2 seconds then picks
    const timer = setTimeout(() => {
      const chosenStat = cpuPickStat(cpuWeights)
      playRound(chosenStat)
    }, 1200)

    return () => clearTimeout(timer)
  }, [isCpuTurn, cpuCard])
  // 👆 End of new block

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Score bar */}
      <ScoreBar playerCards={totalPlayerCards} cpuCards={totalCpuCards} />
        {/* Intel Token Bar */}
        {gameState === 'playing' && !isCpuTurn && (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-2 mb-2"
        >
            <div className="flex items-center gap-3">
            {/* Token display */}
            <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{
                    scale: i < game.intelTokens ? [1, 1.1, 1] : 1,
                    opacity: i < game.intelTokens ? 1 : 0.2
                    }}
                    transition={{ duration: 2, repeat: i < game.intelTokens ? Infinity : 0, delay: i * 0.2 }}
                    style={{
                    width: '28px', height: '28px',
                    borderRadius: '50%',
                    background: i < game.intelTokens
                        ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                        : 'rgba(255,255,255,0.1)',
                    border: i < game.intelTokens
                        ? '2px solid rgba(255,255,255,0.4)'
                        : '2px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    boxShadow: i < game.intelTokens
                        ? '0 0 10px rgba(255,215,0,0.5)'
                        : 'none'
                    }}
                >
                    {i < game.intelTokens ? '⚡' : '○'}
                </motion.div>
                ))}
            </div>

            {/* Intel button */}
            <motion.button
                whileHover={game.intelTokens > 0 && !game.intelActive ? { scale: 1.05 } : {}}
                whileTap={game.intelTokens > 0 && !game.intelActive ? { scale: 0.95 } : {}}
                onClick={game.useIntel}
                disabled={game.intelTokens === 0 || game.intelActive}
                style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '14px',
                letterSpacing: '0.1em',
                color: game.intelActive ? '#000' : game.intelTokens > 0 ? '#000' : 'rgba(255,255,255,0.3)',
                background: game.intelActive
                    ? 'linear-gradient(135deg, #00FF88, #00CC66)'
                    : game.intelTokens > 0
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : 'rgba(255,255,255,0.05)',
                border: game.intelActive
                    ? '2px solid rgba(0,255,136,0.5)'
                    : game.intelTokens > 0
                    ? '2px solid rgba(255,255,255,0.3)'
                    : '2px solid rgba(255,255,255,0.1)',
                cursor: game.intelTokens > 0 && !game.intelActive ? 'pointer' : 'default',
                boxShadow: game.intelActive
                    ? '0 0 20px rgba(0,255,136,0.4)'
                    : game.intelTokens > 0
                    ? '0 0 15px rgba(255,215,0,0.3)'
                    : 'none'
                }}
            >
                {game.intelActive ? '🔍 INTEL ACTIVE' : game.intelTokens > 0 ? '⚡ USE INTEL' : '✗ NO INTEL LEFT'}
            </motion.button>
            </div>

            {/* Intel hint */}
            {game.intelTokens > 0 && !game.intelActive && (
            <p style={{
                fontSize: '10px', color: 'rgba(255,215,0,0.5)',
                letterSpacing: '0.1em', fontFamily: "'Bebas Neue', sans-serif"
            }}>
                REVEALS WIN PROBABILITY — {game.intelTokens} USES REMAINING
            </p>
            )}
            {game.intelActive && (
            <motion.p
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                fontSize: '10px', color: 'rgba(0,255,136,0.8)',
                letterSpacing: '0.1em', fontFamily: "'Bebas Neue', sans-serif"
                }}
            >
                ▶ PICK YOUR STAT WISELY
            </motion.p>
            )}
        </motion.div>
        )}
        {/* Round info */}
        <div className="text-center">
        {!isRoundResult ? (
            isCpuTurn ? (
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-yellow-400 text-sm font-bold tracking-widest uppercase"
            >
                ⏳ CPU is thinking...
            </motion.p>
            ) : (
            <p className="text-gray-400 text-sm">
                Pick a stat to challenge the CPU
            </p>
            )
        ) : (
            <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-black"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
            {roundResult.winner === 'player' && (
                <span className="text-green-400">YOU WIN THIS ROUND! +2 CARDS</span>
            )}
            {roundResult.winner === 'cpu' && (
                <span className="text-red-400">CPU WINS THIS ROUND! -2 CARDS</span>
            )}
            {roundResult.winner === 'tie' && (
                <span className="text-yellow-400">TIE! CARDS RETURNED</span>
            )}
            </motion.p>
        )}
        </div>

      {/* Cards battle area */}
      <div className="flex gap-16 items-center justify-center flex-wrap">
        {/* Player card */}
        <div>
          <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">
            Your Card
          </p>
          {playerCard && (
            <HeroCard
            card={playerCard}
            isPlayer={true}
            isRevealed={true}
            onStatSelect={!isRoundResult && !isCpuTurn ? playRound : null}
            selectedStat={selectedStat}
            roundResult={isRoundResult ? roundResult : null}
            allCards={allCards}
            intelActive={game.intelActive}
            />
          )}
        </div>

        {/* VS divider */}
        <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        >
        <img
            src="/vs-card.png"
            alt="VS"
            style={{
            width: '80px',
            borderRadius: '12px',
            boxShadow: '0 0 30px rgba(255,100,100,0.4), 0 0 30px rgba(100,100,255,0.4)'
            }}
        />
        </motion.div>

        {/* CPU card */}
        <div>
          <p className="text-center text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">
            CPU Card
          </p>
          {cpuCard && (
            <HeroCard
              card={cpuCard}
              isPlayer={false}
              isRevealed={isRoundResult}
              selectedStat={isRoundResult ? roundResult.chosenStat : null}
              roundResult={isRoundResult ? roundResult : null}
              allCards={allCards}
            />
          )}
        </div>
      </div>

      {/* Tie pot indicator */}
      {tiePot.length > 0 && (
        <motion.p
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '14px',
            letterSpacing: '0.1em',
            color: '#FFD700'
          }}
        >
          🏆 TIE POT — {tiePot.length} CARDS AT STAKE!
        </motion.p>
      )}

      {/* Next round button */}
      {isRoundResult && (
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resolveRound}
          style={{
            marginTop: '16px',
            padding: '14px 40px',
            borderRadius: '12px',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '20px',
            letterSpacing: '0.1em',
            fontWeight: '900',
            color: '#000',
            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
            border: '3px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
            boxShadow: '0 0 30px rgba(255,215,0,0.5), 0 4px 15px rgba(0,0,0,0.4)'
          }}
        >
          ⚡ NEXT ROUND →
        </motion.button>
      )}
    </div>
  )
}