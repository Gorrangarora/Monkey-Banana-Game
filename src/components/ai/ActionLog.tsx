import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StateTransition } from '../../types/game';

interface ActionLogProps {
  transitions: StateTransition[];
  currentStep: number;
}

const ACTION_ICONS: Record<string, string> = {
  WALK: '🚶',
  PUSH_BOX: '📦',
  CLIMB_BOX: '🧗',
  DESCEND_BOX: '⬇️',
  GRAB_BANANA: '🍌',
};

const ActionLog: React.FC<ActionLogProps> = ({ transitions, currentStep }) => {
  const logRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current step
  useEffect(() => {
    if (currentRef.current && logRef.current) {
      const logRect = logRef.current.getBoundingClientRect();
      const itemRect = currentRef.current.getBoundingClientRect();
      if (itemRect.bottom > logRect.bottom || itemRect.top < logRect.top) {
        currentRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentStep]);

  if (transitions.length === 0) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '0.82rem',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🤖</div>
        Press <strong>AI Solve</strong> to compute and display the action plan here.
      </div>
    );
  }

  return (
    <div ref={logRef} className="action-log" style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '2px' }}>
      {/* Initial state entry */}
      <div className={`log-entry ${currentStep === -1 ? 'current' : 'completed'}`}>
        <div className={`log-step-number ${currentStep === -1 ? '' : ''}`}>0</div>
        <div className="log-content">
          <div className="log-action-name">Initial State Established</div>
          <div className="log-explanation">
            Monkey: {transitions[0]?.fromState.monkeyPosition} | Box: {transitions[0]?.fromState.boxPosition} | Banana: {transitions[0]?.fromState.bananaPosition}
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {transitions.map((t, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum <= currentStep;
          const isCurrent = stepNum === currentStep + 1 || (currentStep === transitions.length - 1 && idx === transitions.length - 1);
          const isPending = !isCompleted && !isCurrent;

          const entryClass = isCompleted ? 'completed' : isCurrent ? 'current' : 'pending';
          const isLast = idx === transitions.length - 1;

          return (
            <motion.div
              key={`step-${idx}`}
              ref={isCurrent ? currentRef : undefined}
              className={`log-entry ${entryClass}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isPending ? 0.6 : 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
            >
              <div className="log-step-number">{stepNum}</div>
              <div className="log-content">
                <div className="log-action-name" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>{ACTION_ICONS[t.action.type] || '•'}</span>
                  <span>{t.action.description}</span>
                  {isLast && isCompleted && (
                    <span className="badge badge-success" style={{ marginLeft: 'auto', fontSize: '0.62rem' }}>
                      ✓ Goal!
                    </span>
                  )}
                  {isCurrent && (
                    <span className="badge badge-active" style={{ marginLeft: 'auto', fontSize: '0.62rem' }}>
                      ► Active
                    </span>
                  )}
                </div>
                <div className="log-explanation">{t.explanation}</div>
                {/* State change summary */}
                {(isCompleted || isCurrent) && (
                  <div style={{
                    marginTop: '4px',
                    fontSize: '0.7rem',
                    color: '#94a3b8',
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}>
                    {t.fromState.monkeyPosition !== t.toState.monkeyPosition && (
                      <span>🐒 {t.fromState.monkeyPosition} → {t.toState.monkeyPosition}</span>
                    )}
                    {t.fromState.boxPosition !== t.toState.boxPosition && (
                      <span>📦 {t.fromState.boxPosition} → {t.toState.boxPosition}</span>
                    )}
                    {!t.fromState.monkeyOnBox && t.toState.monkeyOnBox && (
                      <span>🧗 Climbed onto box</span>
                    )}
                    {t.fromState.monkeyOnBox && !t.toState.monkeyOnBox && (
                      <span>⬇️ Descended from box</span>
                    )}
                    {t.toState.hasBanana && (
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>🍌 Banana collected!</span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Final state */}
      {currentStep >= transitions.length && transitions.length > 0 && (
        <motion.div
          className="log-entry completed"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'linear-gradient(135deg, #dcfce7, #d1fae5)',
            borderColor: 'rgba(34,197,94,0.4)',
          }}
        >
          <div className="log-step-number" style={{ background: 'var(--success)', color: 'white' }}>
            🏆
          </div>
          <div className="log-content">
            <div className="log-action-name" style={{ color: 'var(--success)', fontSize: '0.9rem' }}>
              Goal Achieved Successfully!
            </div>
            <div className="log-explanation">
              hasBanana === true — The planning problem is solved. The monkey grabbed the banana!
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ActionLog;
