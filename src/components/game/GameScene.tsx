import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MonkeySVG from './MonkeySVG';
import BoxSVG from './BoxSVG';
import BananaSVG from './BananaSVG';
import type { GameState, Position, Action } from '../../types/game';
import { validateAction } from '../../game/gameLogic';

interface GameSceneProps {
  gameState: GameState;
  onAction: (action: Action) => void;
  isAnimating: boolean;
  currentActionType?: string;
  mode: string;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const POSITIONS: Position[] = ['Left', 'Center', 'Right'];

const POS_X: Record<Position, number> = {
  Left: 16,
  Center: 50,
  Right: 84,
};

const GROUND_Y = 68;

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

const GameScene: React.FC<GameSceneProps> = ({
  gameState,
  onAction,
  isAnimating,
  currentActionType,
  mode,
  showToast,
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayToast = useCallback((message: string, type: Toast['type']) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  // Position helpers
  const monkeyX = POS_X[gameState.monkeyPosition];
  const boxX = POS_X[gameState.boxPosition];
  const bananaX = POS_X[gameState.bananaPosition];

  // Monkey vertical offset
  const monkeyY = gameState.monkeyOnBox ? GROUND_Y - 11 : GROUND_Y;

  // Derive animation states
  const isWalking = isAnimating && currentActionType === 'WALK';
  const isPushing = isAnimating && currentActionType === 'PUSH_BOX';
  const isClimbing = isAnimating && currentActionType === 'CLIMB_BOX';
  const isJumping =
    isAnimating &&
    (currentActionType === 'CLIMB_BOX' ||
      currentActionType === 'CLIMB_DOWN' ||
      currentActionType === 'GRAB_BANANA');
  const isGrabbing = isAnimating && currentActionType === 'GRAB_BANANA';
  const isCelebrating = gameState.hasBanana;

  // Determine push direction (towards where the box is moving or banana is)
  const pushDirection: 'left' | 'right' =
    POSITIONS.indexOf(gameState.boxPosition) <= POSITIONS.indexOf(gameState.bananaPosition)
      ? 'right'
      : 'left';

  // Direct monkey click
  const handleMonkeyClick = useCallback(() => {
    if (mode !== 'manual' || isAnimating) return;

    if (gameState.monkeyOnBox) {
      if (gameState.monkeyPosition === gameState.bananaPosition) {
        onAction({ type: 'GRAB_BANANA', description: 'Monkey grabs the banana!' });
      } else {
        onAction({ type: 'CLIMB_DOWN', description: 'Monkey jumps down from the box' });
      }
    } else {
      if (gameState.monkeyPosition === gameState.boxPosition) {
        onAction({ type: 'CLIMB_BOX', description: 'Monkey jumps onto the box' });
      } else {
        displayToast('Use the controls below or click the box to interact!', 'info');
      }
    }
  }, [mode, isAnimating, gameState, onAction, displayToast]);

  // Direct box click
  const handleBoxClick = useCallback(() => {
    if (mode !== 'manual' || isAnimating) return;

    if (gameState.monkeyOnBox) {
      onAction({ type: 'CLIMB_DOWN', description: 'Monkey jumps down from the box' });
      return;
    }

    if (gameState.monkeyPosition === gameState.boxPosition) {
      onAction({ type: 'CLIMB_BOX', description: 'Monkey jumps onto the box' });
    } else {
      // Walk to box
      const walkAction: Action = {
        type: 'WALK',
        target: gameState.boxPosition,
        description: `Monkey walks over to the box at ${gameState.boxPosition}`,
      };
      onAction(walkAction);
    }
  }, [mode, isAnimating, gameState, onAction]);

  // Direct banana click
  const handleBananaClick = useCallback(() => {
    if (mode !== 'manual' || isAnimating) return;

    if (gameState.hasBanana) {
      displayToast('Banana is already collected!', 'info');
      return;
    }

    const action: Action = { type: 'GRAB_BANANA', description: 'Attempt to grab the banana' };
    const result = validateAction(gameState, action);
    if (result.valid) {
      onAction(action);
    } else {
      displayToast(result.explanation, 'error');
      showToast(result.explanation, 'error');
    }
  }, [mode, isAnimating, gameState, onAction, displayToast, showToast]);

  // Click on floor zone
  const handleZoneClick = useCallback(
    (target: Position) => {
      if (mode !== 'manual' || isAnimating) return;

      if (gameState.monkeyPosition === target) {
        displayToast(`Monkey is already at ${target}.`, 'info');
        return;
      }

      if (gameState.monkeyOnBox) {
        displayToast('Monkey is on the box! Jump down first to walk.', 'error');
        return;
      }

      // Walk monkey to target
      onAction({
        type: 'WALK',
        target,
        description: `Walk monkey from ${gameState.monkeyPosition} to ${target}`,
      });
    },
    [mode, isAnimating, gameState, onAction, displayToast]
  );

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className="game-scene"
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #c1e8d5 35%, #8BC34A 65%, #6D9C3E 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* SKY + BACKGROUND ELEMENTS */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7CB342" />
            <stop offset="100%" stopColor="#558B2F" />
          </linearGradient>
          <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4E342E" />
            <stop offset="50%" stopColor="#6D4C41" />
            <stop offset="100%" stopColor="#3E2723" />
          </linearGradient>
        </defs>

        {/* Clouds */}
        <g opacity="0.85">
          <ellipse cx="140" cy="65" rx="50" ry="20" fill="white" />
          <ellipse cx="120" cy="72" rx="35" ry="16" fill="white" />
          <ellipse cx="160" cy="72" rx="35" ry="16" fill="white" />
        </g>
        <g opacity="0.65">
          <ellipse cx="320" cy="75" rx="40" ry="16" fill="white" />
          <ellipse cx="305" cy="80" rx="28" ry="12" fill="white" />
          <ellipse cx="335" cy="80" rx="28" ry="12" fill="white" />
        </g>

        {/* Background trees */}
        <g opacity="0.5">
          <rect x="50" y="180" width="20" height="120" fill="#5D4037" rx="4" />
          <ellipse cx="60" cy="170" rx="40" ry="50" fill="#2E7D32" />
          <ellipse cx="45" cy="185" rx="28" ry="35" fill="#388E3C" />
          <ellipse cx="75" cy="185" rx="28" ry="35" fill="#388E3C" />
        </g>
        <g opacity="0.5">
          <rect x="700" y="170" width="20" height="130" fill="#5D4037" rx="4" />
          <ellipse cx="710" cy="160" rx="45" ry="55" fill="#2E7D32" />
          <ellipse cx="690" cy="178" rx="30" ry="38" fill="#388E3C" />
          <ellipse cx="730" cy="178" rx="30" ry="38" fill="#388E3C" />
        </g>

        {/* Foreground trees */}
        <g>
          <rect x="15" y="200" width="28" height="200" fill="url(#trunkGrad)" rx="6" />
          <ellipse cx="29" cy="185" rx="55" ry="70" fill="#2E7D32" />
          <ellipse cx="15" cy="205" rx="35" ry="45" fill="#388E3C" />
          <ellipse cx="43" cy="200" rx="38" ry="50" fill="#1B5E20" />
          <ellipse cx="29" cy="155" rx="30" ry="22" fill="#4CAF50" />
        </g>
        <g>
          <rect x="740" y="195" width="28" height="200" fill="url(#trunkGrad)" rx="6" />
          <ellipse cx="754" cy="180" rx="58" ry="72" fill="#2E7D32" />
          <ellipse cx="738" cy="200" rx="38" ry="50" fill="#1B5E20" />
          <ellipse cx="770" cy="198" rx="40" ry="52" fill="#388E3C" />
          <ellipse cx="754" cy="148" rx="32" ry="24" fill="#4CAF50" />
        </g>

        {/* Ground */}
        <rect x="0" y="300" width="800" height="100" fill="url(#groundGrad)" />
        <rect x="0" y="300" width="800" height="8" fill="#8BC34A" opacity="0.7" />
        <rect x="0" y="308" width="800" height="4" fill="#558B2F" opacity="0.5" />

        {/* Grass tufts */}
        {[60, 140, 220, 310, 390, 480, 560, 640, 720].map((x, i) => (
          <g key={i} opacity="0.6">
            <path d={`M${x} 304 Q${x - 4} 292 ${x - 2} 286`} stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M${x + 5} 304 Q${x + 8} 288 ${x + 6} 282`} stroke="#66BB6A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d={`M${x + 10} 304 Q${x + 14} 293 ${x + 12} 287`} stroke="#4CAF50" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        ))}

        {/* Sun */}
        <circle cx="680" cy="55" r="32" fill="#FFD54F" opacity="0.85" />
        <circle cx="680" cy="55" r="22" fill="#FFCA28" />
      </svg>

      {/* BANANA */}
      <div
        style={{
          position: 'absolute',
          left: `calc(${bananaX}% - 24px)`,
          top: '4%',
          zIndex: 15,
          transition: 'left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <svg width="4" height="60" viewBox="0 0 4 60" style={{ display: 'block', margin: '0 auto' }}>
          <path d="M2 0 Q3 15 2 30 Q1 45 2 60" stroke="#5D4037" strokeWidth="2.5" fill="none" />
        </svg>
        <div style={{ marginTop: '-8px' }}>
          <BananaSVG onClick={handleBananaClick} collected={gameState.hasBanana} />
        </div>
      </div>

      {/* BOX */}
      <motion.div
        animate={{
          x: isPushing ? [0, pushDirection === 'right' ? 8 : -8, 0] : 0,
        }}
        transition={{
          repeat: isPushing ? Infinity : 0,
          duration: 0.35,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          bottom: `${100 - GROUND_Y}%`,
          left: `calc(${boxX}% - 36px)`,
          zIndex: 12,
          transition: 'left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: mode === 'manual' ? 'pointer' : 'default',
        }}
        onClick={handleBoxClick}
        title={mode === 'manual' ? 'Box — Click to interact' : undefined}
      >
        <BoxSVG isMoving={isPushing} />
      </motion.div>

      {/* MONKEY WITH JUMP & PUSH ANIMATIONS */}
      <motion.div
        animate={{
          y: isJumping ? [0, -42, 0] : 0,
          scaleY: isJumping ? [1, 1.15, 0.9, 1] : 1,
          scaleX: isJumping ? [1, 0.9, 1.08, 1] : 1,
        }}
        transition={
          isJumping
            ? { duration: 0.5, times: [0, 0.45, 0.85, 1], ease: 'easeInOut' }
            : { duration: 0.2 }
        }
        style={{
          position: 'absolute',
          bottom: `${100 - monkeyY - (gameState.monkeyOnBox ? 8 : 0)}%`,
          left: `calc(${monkeyX}% - 37px)`,
          zIndex: 14,
          transition: 'left 0.55s cubic-bezier(0.34, 1.56, 0.64, 1), bottom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: mode === 'manual' ? 'pointer' : 'default',
        }}
        onClick={handleMonkeyClick}
        title={mode === 'manual' ? 'Monkey — Click to act' : undefined}
      >
        <MonkeySVG
          onBox={gameState.monkeyOnBox}
          hasBanana={gameState.hasBanana}
          isWalking={isWalking}
          isPushing={isPushing}
          isJumping={isJumping}
          pushDirection={pushDirection}
          isClimbing={isClimbing}
          isGrabbing={isGrabbing}
          isCelebrating={isCelebrating}
        />
      </motion.div>

      {/* INTERACTIVE FLOOR ZONE LABELS */}
      {POSITIONS.map((pos) => {
        const isCurrent = gameState.monkeyPosition === pos;
        return (
          <button
            key={pos}
            className={`position-label-btn ${isCurrent ? 'active' : ''}`}
            style={{
              position: 'absolute',
              bottom: '12px',
              left: `${POS_X[pos]}%`,
              transform: 'translateX(-50%)',
              zIndex: 20,
              cursor: mode === 'manual' ? 'pointer' : 'default',
            }}
            onClick={() => handleZoneClick(pos)}
            title={mode === 'manual' ? `Walk to ${pos}` : undefined}
          >
            {pos.toUpperCase()}
          </button>
        );
      })}

      {/* Floor markers */}
      {POSITIONS.map((pos) => (
        <div
          key={`marker-${pos}`}
          style={{
            position: 'absolute',
            bottom: `${100 - GROUND_Y + 1}%`,
            left: `${POS_X[pos]}%`,
            transform: 'translateX(-50%)',
            width: '44px',
            height: '4px',
            background: 'rgba(255,255,255,0.45)',
            borderRadius: '4px',
            zIndex: 10,
          }}
        />
      ))}

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`feedback-toast ${toast.type}`}
            style={{ top: '14px' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* VICTORY OVERLAY */}
      <AnimatePresence>
        {gameState.hasBanana && (
          <motion.div
            className="victory-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 18 }).map((_, i) => {
              const angle = (i / 18) * 360;
              const rad = (angle * Math.PI) / 180;
              const dist = 85 + Math.random() * 85;
              const colors = ['#F5C518', '#4CAF50', '#2196F3', '#E91E63', '#FF5722'];
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: colors[i % colors.length],
                    transform: `translate(${Math.cos(rad) * dist}px, ${Math.sin(rad) * dist}px)`,
                    animation: `sparkle ${0.8 + i * 0.1}s ease-out ${i * 0.05}s infinite`,
                  }}
                />
              );
            })}
            <motion.div
              className="victory-card"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="victory-emoji">🎉🍌🐒</div>
              <div className="victory-title">Goal Achieved!</div>
              <div className="victory-text">
                The monkey successfully grabbed the banana!<br />
                AISC State-Space Planning Completed.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameScene;
