import React from 'react';
import type { Algorithm, AnimationSpeed, GameMode, PossibilityId } from '../../types/game';

interface ControlsBarProps {
  mode: GameMode;
  isPlaying: boolean;
  isPaused: boolean;
  speed: AnimationSpeed;
  algorithm: Algorithm;
  showReasoning: boolean;
  showSearchTree: boolean;
  muted: boolean;
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  currentPossibility?: PossibilityId;
  onSelectPossibility?: (id: PossibilityId) => void;
  onAISolve: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onPauseResume: () => void;
  onReset: () => void;
  onManualMode: () => void;
  onAlgorithmChange: (alg: Algorithm) => void;
  onSpeedChange: (speed: AnimationSpeed) => void;
  onToggleReasoning: () => void;
  onToggleSearchTree: () => void;
  onToggleMute: () => void;
  onNewScenario: () => void;
}

const ControlsBar: React.FC<ControlsBarProps> = ({
  mode,
  isPlaying,
  isPaused,
  speed,
  algorithm,
  showReasoning,
  showSearchTree,
  muted,
  currentStep,
  totalSteps,
  isLoading,
  currentPossibility,
  onSelectPossibility,
  onAISolve,
  onStepForward,
  onStepBackward,
  onPauseResume,
  onReset,
  onManualMode,
  onAlgorithmChange,
  onSpeedChange,
  onToggleReasoning,
  onToggleSearchTree,
  onToggleMute,
  onNewScenario,
}) => {
  const isAIActive = mode === 'ai-solving' || mode === 'ai-stepping';
  const canStep = totalSteps > 0;
  const canStepForward = canStep && currentStep < totalSteps;
  const canStepBackward = canStep && currentStep > 0;

  const possibilities: PossibilityId[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="controls-bar">
      {/* AI Solve */}
      <div className="control-group">
        <button
          id="btn-ai-solve"
          className="btn btn-ai"
          onClick={onAISolve}
          disabled={isLoading || mode === 'ai-solving'}
          title="Run AI planner and execute solution"
        >
          {isLoading ? (
            <>
              <span className="loading-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} />
              Planning…
            </>
          ) : (
            <>🤖 AI Solve</>
          )}
        </button>
      </div>

      <div className="control-divider" />

      {/* Possibility Quick Select Buttons */}
      {onSelectPossibility && (
        <>
          <div className="control-group" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Case:</span>
            {possibilities.map((id) => (
              <button
                key={id}
                id={`btn-ctrl-possibility-${id.toLowerCase()}`}
                type="button"
                className={`btn btn-toggle ${currentPossibility === id ? 'active' : ''}`}
                style={{
                  padding: '3px 7px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  minWidth: '26px',
                }}
                disabled={isLoading || isAIActive}
                onClick={() => onSelectPossibility(id)}
                title={`Switch to Possibility ${id}`}
              >
                {id}
              </button>
            ))}
          </div>
          <div className="control-divider" />
        </>
      )}

      {/* Playback controls */}
      <div className="control-group">
        <button
          id="btn-step-back"
          className="btn btn-secondary"
          onClick={onStepBackward}
          disabled={!canStepBackward || isLoading}
          title="Step backward"
          style={{ padding: '7px 10px' }}
        >
          ⏮
        </button>
        <button
          id="btn-pause-resume"
          className="btn btn-secondary"
          onClick={onPauseResume}
          disabled={!isAIActive || !canStep || isLoading}
          title={isPaused ? 'Resume execution' : 'Pause execution'}
          style={{ padding: '7px 10px' }}
        >
          {isPaused || !isPlaying ? '▶' : '⏸'}
        </button>
        <button
          id="btn-step-forward"
          className="btn btn-secondary"
          onClick={onStepForward}
          disabled={!canStepForward || isLoading}
          title="Step forward"
          style={{ padding: '7px 10px' }}
        >
          ⏭
        </button>
      </div>

      {/* Step counter */}
      {totalSteps > 0 && (
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#6b7280',
          padding: '4px 8px',
          background: 'var(--ai-bg)',
          borderRadius: 'var(--radius-md)',
          whiteSpace: 'nowrap',
        }}>
          {currentStep}/{totalSteps}
        </div>
      )}

      <div className="control-divider" />

      {/* Reset & Mode */}
      <div className="control-group">
        <button
          id="btn-reset"
          className="btn btn-danger"
          onClick={onReset}
          title="Reset to initial state"
        >
          ↺ Reset
        </button>
        <button
          id="btn-manual"
          className={`btn btn-toggle ${mode === 'manual' ? 'active' : ''}`}
          onClick={onManualMode}
          title="Switch to manual control mode"
        >
          👋 Manual
        </button>
      </div>

      <div className="control-divider" />

      {/* Algorithm selector */}
      <div className="control-group">
        <label htmlFor="algo-select" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
          Algorithm:
        </label>
        <select
          id="algo-select"
          className="select-control"
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as Algorithm)}
          disabled={isLoading || isAIActive}
        >
          <option value="BFS">BFS (Optimal Shortest)</option>
          <option value="DFS">DFS (Suboptimal Depth Detour)</option>
        </select>
      </div>

      {/* Speed */}
      <div className="control-group">
        <label htmlFor="speed-select" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
          Speed:
        </label>
        <select
          id="speed-select"
          className="select-control"
          value={speed}
          onChange={(e) => onSpeedChange(e.target.value as AnimationSpeed)}
        >
          <option value="slow">Slow</option>
          <option value="normal">Normal</option>
          <option value="fast">Fast</option>
        </select>
      </div>

      <div className="control-divider" />

      {/* Toggle buttons */}
      <div className="control-group">
        <button
          id="btn-toggle-reasoning"
          className={`btn btn-toggle ${showReasoning ? 'active' : ''}`}
          onClick={onToggleReasoning}
          title="Toggle AI reasoning explanations"
        >
          💡 Reasoning
        </button>
        <button
          id="btn-toggle-tree"
          className={`btn btn-toggle ${showSearchTree ? 'active' : ''}`}
          onClick={onToggleSearchTree}
          title="Toggle search tree visualization"
        >
          🌳 Tree
        </button>
        <button
          id="btn-mute"
          className="btn btn-icon"
          onClick={onToggleMute}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>

      <div className="control-divider" />

      {/* New scenario */}
      <div className="control-group">
        <button
          id="btn-new-scenario"
          className="btn btn-secondary"
          onClick={onNewScenario}
          disabled={isLoading}
          title="Cycle through predefined possibilities"
        >
          🎲 Next
        </button>
      </div>
    </div>
  );
};

export default ControlsBar;
