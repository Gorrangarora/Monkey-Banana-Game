import React from 'react';
import type { GameState, Action, Position } from '../../types/game';
import { validateAction } from '../../game/gameLogic';

interface ManualControlsProps {
  gameState: GameState;
  onAction: (action: Action) => void;
  disabled?: boolean;
}

const POSITIONS: Position[] = ['Left', 'Center', 'Right'];

const ManualControls: React.FC<ManualControlsProps> = ({
  gameState,
  onAction,
  disabled = false,
}) => {
  const monkeyPos = gameState.monkeyPosition;
  const boxPos = gameState.boxPosition;
  const bananaPos = gameState.bananaPosition;
  const onBox = gameState.monkeyOnBox;
  const hasBanana = gameState.hasBanana;

  const monkeyAtBox = monkeyPos === boxPos;
  const atBanana = monkeyPos === bananaPos;
  const canGrabNow = onBox && atBanana && !hasBanana;

  // Determine adjacent positions for walk
  const currentIdx = POSITIONS.indexOf(monkeyPos);
  const leftPos = currentIdx > 0 ? POSITIONS[currentIdx - 1] : null;
  const rightPos = currentIdx < POSITIONS.length - 1 ? POSITIONS[currentIdx + 1] : null;

  // Walk actions
  const handleWalk = (target: Position) => {
    onAction({
      type: 'WALK',
      target,
      description: `Walk monkey from ${monkeyPos} to ${target}`,
    });
  };

  // Push actions
  const handlePush = (target: Position) => {
    onAction({
      type: 'PUSH_BOX',
      target,
      description: `Push box with monkey from ${boxPos} to ${target}`,
    });
  };

  // Climb action
  const handleClimb = () => {
    onAction({
      type: 'CLIMB_BOX',
      description: 'Monkey climbs onto the wooden box',
    });
  };

  // Climb down
  const handleClimbDown = () => {
    onAction({
      type: 'CLIMB_DOWN',
      description: 'Monkey climbs down from the wooden box',
    });
  };

  // Grab banana
  const handleGrab = () => {
    onAction({
      type: 'GRAB_BANANA',
      description: 'Monkey grabs the banana from above the box',
    });
  };

  return (
    <div className="manual-controls-panel">
      <div className="manual-controls-header">
        <div className="manual-controls-title">
          <span>🎮 Manual Play Mode</span>
          <span className="manual-controls-sub">Click actions below or use keyboard keys</span>
        </div>
        <div className="keyboard-shortcuts-pill">
          <span>Keyboard:</span>
          <kbd>←</kbd><kbd>→</kbd> Walk
          <span className="kbd-sep">•</span>
          <kbd>Shift</kbd>+<kbd>←/→</kbd> Push
          <span className="kbd-sep">•</span>
          <kbd>↑</kbd> Jump
          <span className="kbd-sep">•</span>
          <kbd>Space</kbd> Grab
        </div>
      </div>

      <div className="manual-actions-grid">
        {/* Walk Section */}
        <div className="action-button-group">
          <span className="action-group-label">🚶 Walk</span>
          <div className="action-buttons-row">
            <button
              className="btn btn-action-card"
              disabled={disabled || onBox || !leftPos}
              onClick={() => leftPos && handleWalk(leftPos)}
              title={onBox ? 'Cannot walk while on top of box' : !leftPos ? 'Already at Left wall' : `Walk left to ${leftPos}`}
            >
              ⬅️ Left {leftPos ? `(${leftPos})` : ''}
            </button>
            <button
              className="btn btn-action-card"
              disabled={disabled || onBox || !rightPos}
              onClick={() => rightPos && handleWalk(rightPos)}
              title={onBox ? 'Cannot walk while on top of box' : !rightPos ? 'Already at Right wall' : `Walk right to ${rightPos}`}
            >
              Right {rightPos ? `(${rightPos})` : ''} ➡️
            </button>
          </div>
        </div>

        {/* Push Box Section */}
        <div className="action-button-group">
          <span className="action-group-label">📦 Push Box</span>
          <div className="action-buttons-row">
            <button
              className="btn btn-action-card"
              disabled={disabled || onBox || !monkeyAtBox || !leftPos}
              onClick={() => leftPos && handlePush(leftPos)}
              title={
                onBox
                  ? 'Cannot push while on top of box'
                  : !monkeyAtBox
                  ? 'Monkey must be at the box to push it'
                  : !leftPos
                  ? 'Box is already at Left wall'
                  : `Push box left to ${leftPos}`
              }
            >
              ⬅️ Push Left
            </button>
            <button
              className="btn btn-action-card"
              disabled={disabled || onBox || !monkeyAtBox || !rightPos}
              onClick={() => rightPos && handlePush(rightPos)}
              title={
                onBox
                  ? 'Cannot push while on top of box'
                  : !monkeyAtBox
                  ? 'Monkey must be at the box to push it'
                  : !rightPos
                  ? 'Box is already at Right wall'
                  : `Push box right to ${rightPos}`
              }
            >
              Push Right ➡️
            </button>
          </div>
        </div>

        {/* Jump / Box Climb Section */}
        <div className="action-button-group">
          <span className="action-group-label">🧗 Box Actions</span>
          <div className="action-buttons-row">
            {!onBox ? (
              <button
                className={`btn btn-action-card ${monkeyAtBox ? 'highlight-btn' : ''}`}
                disabled={disabled || !monkeyAtBox}
                onClick={handleClimb}
                title={monkeyAtBox ? 'Jump up onto the box' : 'Monkey must walk to the box first'}
              >
                🧗 Jump on Box
              </button>
            ) : (
              <button
                className="btn btn-action-card"
                disabled={disabled}
                onClick={handleClimbDown}
                title="Climb down to the floor"
              >
                ⬇️ Jump Down
              </button>
            )}
          </div>
        </div>

        {/* Grab Banana Section */}
        <div className="action-button-group">
          <span className="action-group-label">🍌 Banana</span>
          <div className="action-buttons-row">
            <button
              className={`btn btn-action-card ${canGrabNow ? 'banana-ready-btn' : ''}`}
              disabled={disabled || !canGrabNow || hasBanana}
              onClick={handleGrab}
              title={
                hasBanana
                  ? 'Banana already collected!'
                  : canGrabNow
                  ? 'Ready to grab banana!'
                  : !onBox
                  ? 'Monkey must jump onto the box under the banana'
                  : 'Box is not directly under the banana'
              }
            >
              {hasBanana ? '✅ Collected' : '🍌 Grab Banana'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualControls;
