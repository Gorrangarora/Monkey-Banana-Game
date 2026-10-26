/**
 * Core game logic — state transitions and action validation.
 * This module is used by BOTH frontend and backend to ensure consistency.
 */

import type {
  GameState,
  Action,
  ActionType,
  Position,
  StateTransition,
} from '../types/game';

export const POSITIONS: Position[] = ['Left', 'Center', 'Right'];

export function stateToKey(state: GameState): string {
  return `${state.monkeyPosition}|${state.boxPosition}|${state.bananaPosition}|${state.monkeyOnBox ? '1' : '0'}|${state.hasBanana ? '1' : '0'}`;
}

export function statesEqual(a: GameState, b: GameState): boolean {
  return stateToKey(a) === stateToKey(b);
}

export function isGoalState(state: GameState): boolean {
  return state.hasBanana;
}

export function cloneState(state: GameState): GameState {
  return { ...state };
}

/** Get adjacent positions */
function getAdjacentPositions(pos: Position): Position[] {
  switch (pos) {
    case 'Left': return ['Center'];
    case 'Center': return ['Left', 'Right'];
    case 'Right': return ['Center'];
  }
}

/** Check if monkey can reach target in one move */
function isAdjacent(from: Position, to: Position): boolean {
  return getAdjacentPositions(from).includes(to);
}

/** Calculate direction (Left or Right) between two positions */
export function getActionDirection(from?: Position, to?: Position): 'Left' | 'Right' | null {
  if (!from || !to || from === to) return null;
  const order: Record<Position, number> = { Left: 0, Center: 1, Right: 2 };
  if (order[to] > order[from]) return 'Right';
  if (order[to] < order[from]) return 'Left';
  return null;
}

/** Format concise and human-friendly action label for tree nodes and UI */
export function formatActionLabel(action?: Action | null): string {
  if (!action) return '';
  const dest = action.to || action.target;
  const dir = getActionDirection(action.from, dest);

  switch (action.type) {
    case 'WALK':
      return dir ? `Walk ${dir}` : dest ? `Walk to ${dest}` : 'Walk';
    case 'PUSH_BOX':
      return dir ? `Push ${dir}` : dest ? `Push to ${dest}` : 'Push Box';
    case 'CLIMB_BOX':
      return 'Climb Box';
    case 'DESCEND_BOX':
    case 'CLIMB_DOWN':
      return 'Jump Down';
    case 'GRAB_BANANA':
      return 'Grab Banana';
    default:
      return (action.type as string).replace(/_/g, ' ');
  }
}

/** Generate the explanation for why an action was chosen */
export function generateExplanation(action: Action, fromState: GameState, toState: GameState): string {
  const dir = getActionDirection(action.from || fromState.monkeyPosition, action.to || action.target);
  const dirText = dir ? ` ${dir}` : '';

  switch (action.type) {
    case 'WALK':
      return `The monkey walks${dirText} from ${action.from || fromState.monkeyPosition} to ${action.to || action.target}. This gets the monkey closer to the box.`;
    case 'PUSH_BOX':
      return `The monkey pushes the box${dirText} from ${action.from || fromState.boxPosition} to ${action.to || action.target}. The box must be beneath the banana before climbing.`;
    case 'CLIMB_BOX':
      return `The monkey climbs onto the box at ${fromState.boxPosition}. Standing on the box gives enough height to reach the banana.`;
    case 'DESCEND_BOX':
    case 'CLIMB_DOWN':
      return `The monkey climbs down from the box back to the floor.`;
    case 'GRAB_BANANA':
      return `The monkey is on the box directly beneath the banana at ${fromState.bananaPosition}. It reaches up and grabs the banana!`;
    default:
      return 'Action applied.';
  }
}

/**
 * Apply an action to a state and return the new state, or null if invalid.
 */
export function applyAction(state: GameState, action: Action): GameState | null {
  const s = cloneState(state);

  switch (action.type) {
    case 'WALK': {
      // Preconditions: monkey must be on floor, target must be adjacent
      if (s.monkeyOnBox) return null;
      const dest = action.to || action.target;
      if (!dest) return null;
      if (!isAdjacent(s.monkeyPosition, dest)) return null;
      if (s.monkeyPosition === dest) return null;
      // Effect: monkey moves to target
      s.monkeyPosition = dest;
      return s;
    }

    case 'PUSH_BOX': {
      // Preconditions: monkey on floor, monkey at box, target is adjacent
      if (s.monkeyOnBox) return null;
      if (s.monkeyPosition !== s.boxPosition) return null;
      const dest = action.to || action.target;
      if (!dest) return null;
      if (!isAdjacent(s.boxPosition, dest)) return null;
      s.boxPosition = dest;
      s.monkeyPosition = dest; // monkey moves with box
      return s;
    }

    case 'CLIMB_BOX': {
      // Preconditions: monkey on floor, monkey at same position as box
      if (s.monkeyOnBox) return null;
      if (s.monkeyPosition !== s.boxPosition) return null;
      // Effect: monkey is now on box
      s.monkeyOnBox = true;
      return s;
    }

    case 'DESCEND_BOX':
    case 'CLIMB_DOWN': {
      // Preconditions: monkey on box
      if (!s.monkeyOnBox) return null;
      // Effect: monkey back on floor
      s.monkeyOnBox = false;
      return s;
    }

    case 'GRAB_BANANA': {
      // Preconditions: monkey on box, box at banana position, banana not collected
      if (!s.monkeyOnBox) return null;
      if (s.boxPosition !== s.bananaPosition) return null;
      if (s.hasBanana) return null;
      // Effect: banana collected
      s.hasBanana = true;
      return s;
    }

    default:
      return null;
  }
}

/**
 * Validate a specific action and return result with explanation.
 */
export function validateAction(
  state: GameState,
  action: Action
): { valid: boolean; nextState?: GameState; explanation: string } {
  const result = applyAction(state, action);
  if (result === null) {
    return {
      valid: false,
      explanation: getInvalidActionExplanation(state, action),
    };
  }
  return {
    valid: true,
    nextState: result,
    explanation: generateExplanation(action, state, result),
  };
}

function getInvalidActionExplanation(state: GameState, action: Action): string {
  switch (action.type) {
    case 'WALK': {
      if (state.monkeyOnBox) return 'The monkey cannot walk while standing on the box. It must climb down first.';
      const dest = action.to || action.target;
      if (!dest) return 'No destination specified for walking.';
      if (!isAdjacent(state.monkeyPosition, dest)) return `The monkey cannot walk directly from ${state.monkeyPosition} to ${dest} — they are not adjacent.`;
      return 'The monkey cannot walk to that position.';
    }

    case 'PUSH_BOX': {
      if (state.monkeyOnBox) return 'The monkey cannot push the box while standing on it.';
      if (state.monkeyPosition !== state.boxPosition) return `The monkey must be at the box's position (${state.boxPosition}) to push it. The monkey is currently at ${state.monkeyPosition}.`;
      const dest = action.to || action.target;
      if (!dest || !isAdjacent(state.boxPosition, dest)) return 'The box can only be pushed to an adjacent position.';
      return 'Cannot push the box in that direction.';
    }

    case 'CLIMB_BOX':
      if (state.monkeyOnBox) return 'The monkey is already on the box.';
      if (state.monkeyPosition !== state.boxPosition) return `The monkey must be at the box's position (${state.boxPosition}) to climb it. Walk to the box first.`;
      return 'Cannot climb the box.';

    case 'DESCEND_BOX':
    case 'CLIMB_DOWN':
      if (!state.monkeyOnBox) return 'The monkey is already on the floor.';
      return 'Cannot climb down from the box.';

    case 'GRAB_BANANA':
      if (!state.monkeyOnBox) return 'The monkey cannot reach the banana from the floor! It needs to climb onto the box first.';
      if (state.boxPosition !== state.bananaPosition) return `The box is at ${state.boxPosition} but the banana hangs at ${state.bananaPosition}. Push the box under the banana first!`;
      if (state.hasBanana) return 'The banana has already been collected!';
      return 'Cannot grab the banana.';

    default:
      return 'Unknown action.';
  }
}

/**
 * Generate all possible valid successor states from a given state.
 * Returns an array of (action, nextState) pairs.
 */
export function generateSuccessors(state: GameState): Array<{ action: Action; nextState: GameState }> {
  const successors: Array<{ action: Action; nextState: GameState }> = [];

  // WALK actions
  if (!state.monkeyOnBox) {
    for (const targetPos of POSITIONS) {
      if (targetPos !== state.monkeyPosition && isAdjacent(state.monkeyPosition, targetPos)) {
        const dir = getActionDirection(state.monkeyPosition, targetPos);
        const action: Action = {
          type: 'WALK',
          description: dir ? `Walk ${dir} to ${targetPos}` : `Walk to ${targetPos}`,
          from: state.monkeyPosition,
          to: targetPos,
          target: targetPos,
        };
        const nextState = applyAction(state, action);
        if (nextState) successors.push({ action, nextState });
      }
    }
  }

  // PUSH BOX actions
  if (!state.monkeyOnBox && state.monkeyPosition === state.boxPosition) {
    for (const targetPos of POSITIONS) {
      if (targetPos !== state.boxPosition && isAdjacent(state.boxPosition, targetPos)) {
        const dir = getActionDirection(state.boxPosition, targetPos);
        const action: Action = {
          type: 'PUSH_BOX',
          description: dir ? `Push box ${dir} to ${targetPos}` : `Push box to ${targetPos}`,
          from: state.boxPosition,
          to: targetPos,
          target: targetPos,
        };
        const nextState = applyAction(state, action);
        if (nextState) successors.push({ action, nextState });
      }
    }
  }

  // CLIMB BOX
  {
    const action: Action = {
      type: 'CLIMB_BOX',
      description: 'Climb onto the box',
    };
    const nextState = applyAction(state, action);
    if (nextState) successors.push({ action, nextState });
  }

  // DESCEND BOX
  {
    const action: Action = {
      type: 'DESCEND_BOX',
      description: 'Descend from the box',
    };
    const nextState = applyAction(state, action);
    if (nextState) successors.push({ action, nextState });
  }

  // GRAB BANANA
  {
    const action: Action = {
      type: 'GRAB_BANANA',
      description: 'Grab the banana',
    };
    const nextState = applyAction(state, action);
    if (nextState) successors.push({ action, nextState });
  }

  return successors;
}

/**
 * Build a StateTransition from action application.
 */
export function buildTransition(
  fromState: GameState,
  action: Action,
  toState: GameState
): StateTransition {
  return {
    fromState: cloneState(fromState),
    toState: cloneState(toState),
    action,
    explanation: generateExplanation(action, fromState, toState),
  };
}
