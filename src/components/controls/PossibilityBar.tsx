import React from 'react';
import type { Possibility, PossibilityId } from '../../types/game';

interface PossibilityBarProps {
  possibilities: Possibility[];
  currentPossibility: PossibilityId;
  onSelectPossibility: (id: PossibilityId) => void;
  onReplayVoice: (id: PossibilityId) => void;
  disabled?: boolean;
}

const PossibilityBar: React.FC<PossibilityBarProps> = ({
  possibilities,
  currentPossibility,
  onSelectPossibility,
  onReplayVoice,
  disabled = false,
}) => {
  return (
    <div
      className="possibility-narrow-bar"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
      }}
    >
      {/* Header title in a narrow line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.82rem' }}>🎯</span>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--jungle-deep)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Starting Possibilities
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              color: '#059669',
              background: 'rgba(16, 185, 129, 0.12)',
              padding: '1px 6px',
              borderRadius: '9999px',
              fontWeight: 600,
            }}
          >
            Voice 🔊
          </span>
        </div>
        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
          Select A, B, C, or D
        </span>
      </div>

      {/* Narrow horizontal line of possibility pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          width: '100%',
        }}
      >
        {possibilities.map((p) => {
          const isSelected = p.id === currentPossibility;
          const posShort = `🐒${p.state.monkeyPosition[0]} 📦${p.state.boxPosition[0]} 🍌${p.state.bananaPosition[0]}`;

          return (
            <div
              key={p.id}
              id={`possibility-card-${p.id.toLowerCase()}`}
              className={`possibility-pill-btn ${isSelected ? 'active' : ''}`}
              onClick={() => !disabled && onSelectPossibility(p.id)}
              role="button"
              tabIndex={0}
              title={`${p.name}: Monkey ${p.state.monkeyPosition}, Box ${p.state.boxPosition}, Banana ${p.state.bananaPosition} (Click to select & hear voice)`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (!disabled) onSelectPossibility(p.id);
                }
              }}
              style={{
                cursor: disabled ? 'not-allowed' : 'pointer',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                border: isSelected ? '1.5px solid var(--jungle-mid)' : '1px solid rgba(0,0,0,0.1)',
                background: isSelected
                  ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                  : '#ffffff',
                boxShadow: isSelected
                  ? '0 2px 8px rgba(16, 185, 129, 0.2)'
                  : '0 1px 2px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                transition: 'all 0.15s ease',
                minWidth: 0,
                position: 'relative',
              }}
            >
              {/* Row 1: Letter Badge, Name, Voice Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: 0 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 17,
                      height: 17,
                      borderRadius: '50%',
                      background: isSelected ? 'var(--jungle-mid)' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#334155',
                      fontWeight: 800,
                      fontSize: '0.68rem',
                      flexShrink: 0,
                    }}
                  >
                    {p.id}
                  </span>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.73rem',
                      color: isSelected ? 'var(--jungle-deep)' : '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    Case {p.id}
                  </span>
                </div>

                <button
                  type="button"
                  id={`btn-voice-${p.id.toLowerCase()}`}
                  title={`Hear voice narration for Possibility ${p.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplayVoice(p.id);
                  }}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    padding: '0 2px',
                    opacity: isSelected ? 1 : 0.6,
                    lineHeight: 1,
                  }}
                >
                  🔊
                </button>
              </div>

              {/* Row 2: Short Positions summary */}
              <div
                style={{
                  fontSize: '0.64rem',
                  color: isSelected ? '#065f46' : '#64748b',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {posShort}
              </div>

              {/* Row 3: Steps comparison pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.6rem',
                  fontWeight: 600,
                }}
              >
                <span style={{ color: '#059669' }}>BFS:{p.bfsSteps}</span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <span style={{ color: '#d97706' }}>DFS:{p.dfsSteps}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PossibilityBar;
