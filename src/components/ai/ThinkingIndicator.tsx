import React from 'react';
import type { PlanningStage } from '../../types/game';

interface ThinkingIndicatorProps {
  stage: PlanningStage;
}

const STAGES: { id: PlanningStage; label: string; icon: string }[] = [
  { id: 'analyzing-initial', label: 'Analyzing initial state', icon: '🔍' },
  { id: 'identifying-goal', label: 'Identifying goal state', icon: '🎯' },
  { id: 'generating-actions', label: 'Generating valid actions', icon: '⚙️' },
  { id: 'exploring-states', label: 'Exploring state space', icon: '🗺️' },
  { id: 'finding-solution', label: 'Finding solution path', icon: '🔗' },
  { id: 'executing-plan', label: 'Executing the plan', icon: '▶️' },
  { id: 'verifying-goal', label: 'Verifying goal reached', icon: '✅' },
];

const STAGE_ORDER = STAGES.map((s) => s.id);

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ stage }) => {
  if (stage === 'idle' || stage === 'complete') return null;

  const currentIdx = STAGE_ORDER.indexOf(stage as typeof STAGES[0]['id']);

  return (
    <div className="thinking-container">
      <div className="thinking-title">
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: '2.5px solid #7c3aed',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        AI Planning in Progress
      </div>
      <div className="thinking-stages">
        {STAGES.map((s, idx) => {
          const isDone = idx < currentIdx;
          const isActive = idx === currentIdx;
          return (
            <div
              key={s.id}
              className={`thinking-stage ${isDone ? 'stage-done' : isActive ? 'stage-active' : ''}`}
            >
              <div className="thinking-stage-icon">
                {isDone ? '✓' : isActive ? s.icon : idx + 1}
              </div>
              {s.label}
              {isActive && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.7rem',
                  color: '#7c3aed',
                  display: 'flex',
                  gap: '2px',
                }}>
                  {'●'.split('').map((_, i) => (
                    <span
                      key={i}
                      style={{
                        animation: `pulse-stage 0.8s ease-in-out ${i * 0.2}s infinite`,
                        display: 'inline-block',
                      }}
                    >
                      ●
                    </span>
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ThinkingIndicator;
