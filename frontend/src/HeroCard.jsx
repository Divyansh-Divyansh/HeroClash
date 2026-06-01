import { motion } from 'framer-motion'
import { calcWinProbability } from './utils'
import { Brain, Zap, Shield, Flame, Swords, Gauge, BatteryWarning, Globe, Skull } from 'lucide-react'

const STAT_ICONS = {
  intelligence: Brain,
  strength: Gauge,
  speed: Zap,
  durability: Shield,
  power: Flame,
  combat: Swords
}

const MARVEL_THEME = {
  primary: '#C41E3A',
  secondary: '#8B0000',
  accent: '#FF4444',
  glow: 'rgba(196, 30, 58, 0.6)',
  border: 'linear-gradient(145deg, #FF6B6B, #C41E3A, #8B0000, #C41E3A)',
  headerBg: 'linear-gradient(135deg, #8B0000 0%, #C41E3A 50%, #8B0000 100%)',
  statBg: 'rgba(196, 30, 58, 0.15)',
  statBorder: 'rgba(196, 30, 58, 0.4)',
  statHover: 'rgba(196, 30, 58, 0.35)',
}

const DC_THEME = {
  primary: '#0057B8',
  secondary: '#003A7A',
  accent: '#4488FF',
  glow: 'rgba(0, 87, 184, 0.6)',
  border: 'linear-gradient(145deg, #6699FF, #0057B8, #003A7A, #0057B8)',
  headerBg: 'linear-gradient(135deg, #003A7A 0%, #0057B8 50%, #003A7A 100%)',
  statBg: 'rgba(0, 87, 184, 0.15)',
  statBorder: 'rgba(0, 87, 184, 0.4)',
  statHover: 'rgba(0, 87, 184, 0.35)',
}

export default function HeroCard({
  card,
  isPlayer,
  isRevealed = true,
  onStatSelect,
  selectedStat,
  roundResult,
  allCards,
  intelActive = false
}) {
  const isMarvel = card.publisher?.includes('Marvel')
  const theme = isMarvel ? MARVEL_THEME : DC_THEME
  const isWinner = roundResult?.winner === (isPlayer ? 'player' : 'cpu')
  const isLoser = roundResult && roundResult.winner !== 'tie' && !isWinner

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{
        y: 0,
        opacity: 1,
        scale: roundResult ? (isWinner ? 1.04 : 0.94) : 1,
      }}
      transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
      style={{
        width: '280px',
        borderRadius: '16px',
        padding: '3px',
        background: theme.border,
        boxShadow: roundResult
          ? isWinner
            ? `0 0 50px ${theme.glow}, 0 0 100px ${theme.glow}`
            : '0 4px 20px rgba(0,0,0,0.6)'
          : `0 0 20px ${theme.glow}, 0 8px 32px rgba(0,0,0,0.5)`,
        filter: isLoser ? 'brightness(0.45) saturate(0.5)' : 'brightness(1)',
        position: 'relative'
      }}
    >
      {/* Inner card */}
      <div style={{
        borderRadius: '14px',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #0d0d1a 0%, #111128 40%, #0a0a15 100%)',
      }}>

        {/* Corner decorations */}
        <div style={{
          position: 'absolute', top: '10px', left: '10px',
          width: '18px', height: '18px', borderTop: `2px solid ${theme.primary}`,
          borderLeft: `2px solid ${theme.primary}`, borderRadius: '3px 0 0 0', zIndex: 10
        }} />
        <div style={{
          position: 'absolute', top: '10px', right: '10px',
          width: '18px', height: '18px', borderTop: `2px solid ${theme.primary}`,
          borderRight: `2px solid ${theme.primary}`, borderRadius: '0 3px 0 0', zIndex: 10
        }} />

        {/* Universe badge */}
        {isRevealed && (
          <div style={{
            position: 'absolute', top: '14px', left: '50%',
            transform: 'translateX(-50%)', zIndex: 10,
            display: 'flex', gap: '4px'
          }}>
            <span style={{
              background: card.publisher?.includes('Marvel') 
                ? 'rgba(196,30,58,0.9)' 
                : card.publisher?.includes('DC')
                  ? 'rgba(0,87,184,0.9)'
                  : 'rgba(80,80,80,0.9)',
              padding: '2px 8px', borderRadius: '20px',
              fontSize: '9px', fontWeight: '900',
              letterSpacing: '0.15em', color: 'white',
              fontFamily: "'Bebas Neue', sans-serif",
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', gap: '3px'
            }}>
              {card.publisher?.includes('Marvel') 
                ? <><Zap size={8}/> MARVEL</>
                : card.publisher?.includes('DC') 
                  ? <><BatteryWarning size={8}/> DC</>
                  : <><Globe size={8}/> OTHER</>}
            </span>
            {card.alignment === 'bad' && (
              <span style={{
                background: 'rgba(180,0,0,0.9)',
                padding: '2px 8px', borderRadius: '20px',
                fontSize: '9px', fontWeight: '900',
                letterSpacing: '0.15em', color: 'white',
                fontFamily: "'Bebas Neue', sans-serif",
                border: '1px solid rgba(255,0,0,0.3)',
                display: 'flex', alignItems: 'center', gap: '3px'
              }}>
                <Skull size={8}/> VILLAIN
              </span>
            )}
          </div>
        )}

        {/* Hero Image */}
        <div style={{ position: 'relative', height: '230px', overflow: 'hidden' }}>
          {isRevealed ? (
            <>
              <motion.img
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
                src={card.image}
                alt={card.name}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'top'
                }}
              />
              {/* Image overlay gradient */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(to bottom, 
                  rgba(0,0,0,0.1) 0%, 
                  rgba(0,0,0,0) 40%,
                  rgba(10,10,21,0.8) 80%,
                  rgba(10,10,21,1) 100%)`
              }} />
            </>
          ) : (
            <img
              src={isMarvel ? '/marvel-back.png' : '/dc-back.png'}
              alt="Card back"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </div>

        {/* Name Banner */}
        <div style={{
          background: theme.headerBg,
          padding: '8px 16px',
          textAlign: 'center',
          borderTop: `1px solid ${theme.accent}`,
          borderBottom: `1px solid ${theme.accent}`,
          position: 'relative'
        }}>
          {/* Side decorations */}
          <div style={{
            position: 'absolute', left: '8px', top: '50%',
            transform: 'translateY(-50%)',
            color: theme.accent, fontSize: '10px', opacity: 0.7
          }}>◆</div>
          <div style={{
            position: 'absolute', right: '8px', top: '50%',
            transform: 'translateY(-50%)',
            color: theme.accent, fontSize: '10px', opacity: 0.7
          }}>◆</div>

          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: isRevealed ? '20px' : '18px',
            letterSpacing: '0.08em',
            color: 'white',
            margin: 0,
            textShadow: `0 0 20px ${theme.glow}`,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {isRevealed ? card.name : '— UNKNOWN —'}
          </h2>
        </div>

        {/* Stats */}
        <div style={{ padding: '10px 12px 14px' }}>
          {Object.entries(card.stats).map(([stat, value]) => {
            const isSelected = selectedStat === stat
            const canClick = isPlayer && !roundResult && !!onStatSelect
            const showProb = intelActive && isPlayer && !roundResult && allCards

            return (
              <motion.button
                key={stat}
                disabled={!canClick}
                onClick={() => onStatSelect?.(stat)}
                whileHover={canClick ? { x: 4, scale: 1.02 } : {}}
                whileTap={canClick ? { scale: 0.97 } : {}}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 8px',
                  marginBottom: '4px',
                  borderRadius: '6px',
                  background: isSelected ? theme.statHover : theme.statBg,
                  border: `1px solid ${isSelected ? theme.accent : theme.statBorder}`,
                  cursor: canClick ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 0 10px ${theme.glow}` : 'none'
                }}
              >
                {(() => {
                  const Icon = STAT_ICONS[stat]
                  return (
                    <Icon
                      size={14}
                      strokeWidth={2.5}
                      color={isSelected ? 'white' : theme.accent}
                      style={{ minWidth: '14px' }}
                    />
                  )
                })()}
                <span style={{
                  flex: 1, textAlign: 'left',
                  fontSize: '11px', fontWeight: '700',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                  fontFamily: "'Bebas Neue', sans-serif",
                }}>
                  {stat}
                </span>
                <span style={{
                  fontSize: '14px', fontWeight: '900',
                  color: isSelected ? 'white' : theme.accent,
                  fontFamily: "'Bebas Neue', sans-serif",
                  minWidth: '28px', textAlign: 'right',
                  textShadow: isSelected ? `0 0 10px ${theme.glow}` : 'none'
                }}>
                  {isRevealed ? value : '??'}
                </span>
                {showProb && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      fontSize: '10px', fontWeight: '700',
                      color: theme.accent,
                      background: theme.statBg,
                      padding: '1px 5px',
                      borderRadius: '10px',
                      border: `1px solid ${theme.statBorder}`,
                      minWidth: '36px',
                      textAlign: 'center'
                    }}
                  >
                    {calcWinProbability(value, stat, allCards)}%
                  </motion.span>
                )}
              </motion.button>
            )
          })}
        </div>

        {/* Bottom decoration */}
        <div style={{
          textAlign: 'center', paddingBottom: '10px',
          fontSize: '8px', letterSpacing: '0.2em',
          color: theme.primary, fontWeight: '700',
          fontFamily: "'Bebas Neue', sans-serif",
          opacity: 0.6
        }}>
          ◆ HEROCLASH ◆
        </div>

        {/* Corner decorations bottom */}
        <div style={{
          position: 'absolute', bottom: '10px', left: '10px',
          width: '18px', height: '18px',
          borderBottom: `2px solid ${theme.primary}`,
          borderLeft: `2px solid ${theme.primary}`,
          borderRadius: '0 0 0 3px'
        }} />
        <div style={{
          position: 'absolute', bottom: '10px', right: '10px',
          width: '18px', height: '18px',
          borderBottom: `2px solid ${theme.primary}`,
          borderRight: `2px solid ${theme.primary}`,
          borderRadius: '0 0 3px 0'
        }} />
      </div>

      {/* WIN badge */}
      {roundResult && isWinner && (
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: -5 }}
          transition={{ type: 'spring', bounce: 0.6 }}
          style={{
            position: 'absolute',
            top: '185px',
            left: '50%',
            transform: 'translateX(-50%) rotate(-5deg)',
            background: 'rgba(255, 215, 0, 0.25)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            color: '#FFD700',
            fontWeight: '900',
            fontSize: '24px',
            padding: '8px 24px',
            borderRadius: '12px',
            zIndex: 20,
            fontFamily: "'Bebas Neue', sans-serif",
            letterSpacing: '0.1em',
            boxShadow: '0 0 30px rgba(255,215,0,0.3)',
            border: '2px solid rgba(255,215,0,0.4)',
            whiteSpace: 'nowrap'
          }}
        >
          ⭐ WIN!
        </motion.div>
      )}
    </motion.div>
  )
}