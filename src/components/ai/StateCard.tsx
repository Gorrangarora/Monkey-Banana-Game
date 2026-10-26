import React from 'react';
import type { GameState, GameMode, Algorithm } from '../../types/game';

interface StateCardProps {
  gameState: GameState;
  mode: GameMode;
  algorithm: Algorithm;
}

function positionIcon(pos: string): string {
  if (pos === 'Left') return '⬅️';
  if (pos === 'Right') return '➡️';
  return '⬆️';
}

const StateCard: React.FC<StateCardProps> = ({ gameState, mode, algorithm }) => {
  const items = [
    { icon: '🐒', label: 'Monkey Position', value: gameState.monkeyPosition },
    { icon: '📦', label: 'Box Position', value: gameState.boxPosition },
    { icon: '🍌', label: 'Banana Position', value: gameState.bananaPosition },
    {
      icon: '🧗',
      label: 'On Box',
      value: gameState.monkeyOnBox ? 'Yes' : 'No',
      highlight: gameState.monkeyOnBox,
    },
    {
      icon: '✅',
      label: 'Has Banana',
      value: gameState.hasBanana ? 'Yes — Goal!' : 'No',
      highlight: gameState.hasBanana,
      success: gameState.hasBanana,
    },
    {
      icon: '🤖',
      label: 'Algorithm',
      value: algorithm,
    },
  ];

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="card-title">
        <span className="card-title-icon">📊</span>
        Current Game State
        <span
          className={`badge ${mode === 'ai-solving' ? 'badge-warning' : mode === 'celebrating' ? 'badge-success' : 'badge-pending'}`}
          style={{ marginLeft: 'auto', fontSize: '0.65rem' }}
        >
          {mode === 'ai-solving' ? '🤖 AI Running' : mode === 'ai-stepping' ? '⏸ Stepping' : mode === 'celebrating' ? '🎉 Goal!' : '👋 Manual'}
        </span>
      </div>
      <div className="state-grid">
        {items.map((item) => (
          <div
            key={item.label}
            className="state-item"
            style={{
              borderColor: item.success
                ? 'rgba(34,197,94,0.4)'
                : item.highlight
                ? 'rgba(59,130,246,0.3)'
                : undefined,
              background: item.success
                ? 'var(--success-bg)'
                : item.highlight
                ? 'var(--active-bg)'
                : undefined,
              transition: 'all 0.3s ease',
            }}
          >
            <span className="state-item-icon">{item.icon}</span>
            <div>
              <div className="state-item-label">{item.label}</div>
              <div
                className="state-item-value"
                style={{ color: item.success ? 'var(--success)' : item.highlight ? 'var(--active)' : undefined }}
              >
                {item.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Goal condition */}
      <div
        style={{
          marginTop: '10px',
          padding: '8px 10px',
          borderRadius: 'var(--radius-md)',
          background: gameState.hasBanana ? 'var(--success-bg)' : 'var(--pending-bg)',
          border: `1px solid ${gameState.hasBanana ? 'rgba(34,197,94,0.3)' : 'transparent'}`,
          fontSize: '0.75rem',
          color: gameState.hasBanana ? 'var(--success)' : '#64748b',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.4s ease',
        }}
      >
        <span>{gameState.hasBanana ? '🏆' : '🎯'}</span>
        <span>
          {gameState.hasBanana
            ? 'GOAL STATE REACHED — hasBanana === true'
            : 'Goal: hasBanana === true (not yet achieved)'}
        </span>
      </div>
    </div>
  );
};

export default StateCard;
