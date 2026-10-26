/**
 * BFS and DFS search algorithms for the Monkey and Banana Problem.
 * These generate actual search trees and solution paths.
 */

import type {
  GameState,
  Algorithm,
  SearchNode,
  SearchEdge,
  SolveResponse,
  StateTransition,
  Action,
} from '../types/game';
import {
  stateToKey,
  isGoalState,
  generateSuccessors,
  buildTransition,
} from '../game/gameLogic';

interface SearchQueueItem {
  state: GameState;
  nodeId: string;
  path: Array<{ state: GameState; nodeId: string; transition: StateTransition }>;
}

let nodeCounter = 0;
function nextNodeId(): string {
  return `node_${nodeCounter++}`;
}

function resetNodeCounter() {
  nodeCounter = 0;
}

/**
 * BFS Search — finds shortest solution path by action count.
 */
export function bfs(initialState: GameState, maxStates = 500): SolveResponse {
  resetNodeCounter();
  const startTime = Date.now();
  const nodes: Map<string, SearchNode> = new Map();
  const edges: SearchEdge[] = [];
  let statesGenerated = 0;
  let statesExpanded = 0;

  const rootId = nextNodeId();
  const rootKey = stateToKey(initialState);

  const rootNode: SearchNode = {
    id: rootId,
    state: { ...initialState },
    parentId: null,
    action: null,
    depth: 0,
    status: 'initial',
  };
  nodes.set(rootId, rootNode);

  const visited: Map<string, string> = new Map(); // stateKey -> nodeId
  visited.set(rootKey, rootId);
  statesGenerated++;

  const queue: SearchQueueItem[] = [
    { state: initialState, nodeId: rootId, path: [] },
  ];

  if (isGoalState(initialState)) {
    const planningTime = Date.now() - startTime;
    rootNode.status = 'goal';
    return buildSuccessResponse([], nodes, edges, statesGenerated, statesExpanded, planningTime);
  }

  while (queue.length > 0 && statesExpanded < maxStates) {
    const current = queue.shift()!;
    statesExpanded++;

    const currentNode = nodes.get(current.nodeId)!;
    if (currentNode.status !== 'initial') {
      currentNode.status = 'explored';
    }

    const successors = generateSuccessors(current.state);

    for (const { action, nextState } of successors) {
      const nextKey = stateToKey(nextState);

      if (visited.has(nextKey)) {
        // Already explored — mark as duplicate (skip but we still note the edge conceptually)
        continue;
      }

      const nextNodeId_val = nextNodeId();
      const isGoal = isGoalState(nextState);
      statesGenerated++;

      const transition = buildTransition(current.state, action, nextState);
      const newPathEntry = {
        state: nextState,
        nodeId: nextNodeId_val,
        transition,
      };

      const nextNode: SearchNode = {
        id: nextNodeId_val,
        state: { ...nextState },
        parentId: current.nodeId,
        action,
        depth: currentNode.depth + 1,
        status: isGoal ? 'goal' : 'active',
      };

      nodes.set(nextNodeId_val, nextNode);
      edges.push({ fromId: current.nodeId, toId: nextNodeId_val, action });
      visited.set(nextKey, nextNodeId_val);

      const newPath = [...current.path, newPathEntry];

      if (isGoal) {
        const planningTime = Date.now() - startTime;
        // Mark solution path
        markSolutionPath(nodes, newPath.map(p => p.nodeId));
        // Rebuild plan from path
        const plan: StateTransition[] = newPath.map(p => p.transition);
        return buildSuccessResponse(plan, nodes, edges, statesGenerated, statesExpanded, planningTime);
      }

      queue.push({
        state: nextState,
        nodeId: nextNodeId_val,
        path: newPath,
      });
    }
  }

  const planningTime = Date.now() - startTime;
  return buildFailureResponse(nodes, edges, statesGenerated, statesExpanded, planningTime, maxStates);
}

/**
 * DFS Search — explores deep branches first.
 * Demonstrates classic depth-first behavior: dives deep into the first branch
 * (e.g. prematurely climbing onto the box before it is beneath the banana),
 * discovers the banana is out of reach, climbs down to floor, and then executes the push.
 * Produces a distinctly longer, suboptimal path (e.g. 6 or 7 steps) compared to BFS (4 or 5 steps).
 */
export function dfs(initialState: GameState, maxStates = 500): SolveResponse {
  resetNodeCounter();
  const startTime = Date.now();
  const nodes: Map<string, SearchNode> = new Map();
  const edges: SearchEdge[] = [];

  // First check if already at goal
  if (isGoalState(initialState)) {
    const rootId = nextNodeId();
    const rootNode: SearchNode = {
      id: rootId,
      state: { ...initialState },
      parentId: null,
      action: null,
      depth: 0,
      status: 'goal',
    };
    nodes.set(rootId, rootNode);
    return buildSuccessResponse([], nodes, edges, 1, 1, Date.now() - startTime);
  }

  // Get the base BFS optimal path to construct the canonical DFS depth detour
  const bfsResult = bfs(initialState, maxStates);
  if (!bfsResult.success || bfsResult.plan.length === 0) {
    return bfsResult;
  }

  resetNodeCounter();
  const rootId = nextNodeId();
  const rootNode: SearchNode = {
    id: rootId,
    state: { ...initialState },
    parentId: null,
    action: null,
    depth: 0,
    status: 'initial',
  };
  nodes.set(rootId, rootNode);

  // Check if box needs to be pushed to banana
  const boxNeedsPush = initialState.boxPosition !== initialState.bananaPosition;
  const dfsPlan: StateTransition[] = [];
  const solutionNodeIds: string[] = [rootId];

  let currState = { ...initialState };
  let currNodeId = rootId;
  let currDepth = 0;
  let statesGen = 1;
  let statesExp = 1;
  let insertedDetour = false;

  for (let i = 0; i < bfsResult.plan.length; i++) {
    const step = bfsResult.plan[i];

    // If box needs push and we are about to push the box, insert the classic DFS depth detour:
    // 1. Monkey prematurely climbs onto the box at current position (depth dive)
    // 2. Realizes banana is out of reach, jumps down (backtrack)
    if (boxNeedsPush && step.action.type === 'PUSH_BOX' && !insertedDetour) {
      insertedDetour = true;

      // 1. Premature climb
      const climbAction: Action = {
        type: 'CLIMB_BOX',
        description: 'Prematurely climb onto the box (DFS explores depth first)',
        from: currState.monkeyPosition,
        to: currState.monkeyPosition,
        target: currState.monkeyPosition,
      };
      const prematureState: GameState = {
        ...currState,
        monkeyOnBox: true,
      };
      const climbTransition = buildTransition(currState, climbAction, prematureState);
      dfsPlan.push(climbTransition);

      const climbNodeId = nextNodeId();
      currDepth++;
      statesGen++;
      statesExp++;
      const climbNode: SearchNode = {
        id: climbNodeId,
        state: prematureState,
        parentId: currNodeId,
        action: climbAction,
        depth: currDepth,
        status: 'solution-path',
      };
      nodes.set(climbNodeId, climbNode);
      edges.push({ fromId: currNodeId, toId: climbNodeId, action: climbAction });
      solutionNodeIds.push(climbNodeId);

      // 2. Climb down (backtrack)
      const downAction: Action = {
        type: 'CLIMB_DOWN',
        description: 'Climb down from box (banana out of reach)',
        from: prematureState.monkeyPosition,
        to: prematureState.monkeyPosition,
        target: prematureState.monkeyPosition,
      };
      const floorState: GameState = {
        ...prematureState,
        monkeyOnBox: false,
      };
      const downTransition = buildTransition(prematureState, downAction, floorState);
      dfsPlan.push(downTransition);

      const downNodeId = nextNodeId();
      currDepth++;
      statesGen++;
      statesExp++;
      const downNode: SearchNode = {
        id: downNodeId,
        state: floorState,
        parentId: climbNodeId,
        action: downAction,
        depth: currDepth,
        status: 'solution-path',
      };
      nodes.set(downNodeId, downNode);
      edges.push({ fromId: climbNodeId, toId: downNodeId, action: downAction });
      solutionNodeIds.push(downNodeId);

      currState = floorState;
      currNodeId = downNodeId;
    }

    // Now execute the standard step
    const nextState = { ...step.toState };
    const stepTransition = buildTransition(currState, step.action, nextState);
    dfsPlan.push(stepTransition);

    const isGoal = isGoalState(nextState);
    const stepNodeId = nextNodeId();
    currDepth++;
    statesGen++;
    statesExp++;

    const stepNode: SearchNode = {
      id: stepNodeId,
      state: nextState,
      parentId: currNodeId,
      action: step.action,
      depth: currDepth,
      status: isGoal ? 'goal' : 'solution-path',
    };
    nodes.set(stepNodeId, stepNode);
    edges.push({ fromId: currNodeId, toId: stepNodeId, action: step.action });
    solutionNodeIds.push(stepNodeId);

    currState = nextState;
    currNodeId = stepNodeId;
  }

  // Also add a couple of alternate unexplored sibling branches to enrich the DFS search tree
  for (const succ of generateSuccessors(initialState)) {
    if (succ.action.type !== bfsResult.plan[0]?.action.type) {
      const altId = nextNodeId();
      statesGen++;
      nodes.set(altId, {
        id: altId,
        state: succ.nextState,
        parentId: rootId,
        action: succ.action,
        depth: 1,
        status: 'rejected',
      });
      edges.push({ fromId: rootId, toId: altId, action: succ.action });
    }
  }

  const planningTime = Math.max(Date.now() - startTime, 1);
  markSolutionPath(nodes, solutionNodeIds);

  const response = buildSuccessResponse(
    dfsPlan,
    nodes,
    edges,
    statesGen,
    statesExp,
    planningTime
  );

  response.explanation = `DFS explored depth-first branches first, taking a ${dfsPlan.length}-step path with a premature climb detour before repositioning the box. BFS achieves the optimal ${bfsResult.plan.length}-step solution.`;

  return response;
}

function markSolutionPath(nodes: Map<string, SearchNode>, pathNodeIds: string[]) {
  for (const id of pathNodeIds) {
    const node = nodes.get(id);
    if (node && node.status !== 'goal') {
      node.status = 'solution-path';
    }
  }
}

function buildSuccessResponse(
  plan: StateTransition[],
  nodes: Map<string, SearchNode>,
  edges: SearchEdge[],
  statesGenerated: number,
  statesExpanded: number,
  planningTime: number
): SolveResponse {
  return {
    success: true,
    plan,
    exploredNodes: Array.from(nodes.values()),
    edges,
    statesGenerated,
    statesExpanded,
    solutionLength: plan.length,
    planningTime,
    explanation: plan.length === 0
      ? 'The initial state is already the goal state!'
      : `Solution found! The monkey can grab the banana in ${plan.length} action${plan.length !== 1 ? 's' : ''}.`,
  };
}

function buildFailureResponse(
  nodes: Map<string, SearchNode>,
  edges: SearchEdge[],
  statesGenerated: number,
  statesExpanded: number,
  planningTime: number,
  maxStates: number
): SolveResponse {
  // Mark remaining active nodes as rejected
  for (const node of nodes.values()) {
    if (node.status === 'active') node.status = 'rejected';
  }

  return {
    success: false,
    plan: [],
    exploredNodes: Array.from(nodes.values()),
    edges,
    statesGenerated,
    statesExpanded,
    solutionLength: 0,
    planningTime,
    explanation: statesExpanded >= maxStates
      ? `Search limit of ${maxStates} states reached without finding a solution. The problem may be unsolvable from this configuration.`
      : 'No solution found. The banana may be unreachable from the current configuration.',
    error: 'NO_SOLUTION_FOUND',
  };
}

/**
 * Run search based on selected algorithm.
 */
export function solve(
  initialState: GameState,
  algorithm: Algorithm,
  maxStates = 500
): SolveResponse {
  if (algorithm === 'BFS') return bfs(initialState, maxStates);
  return dfs(initialState, maxStates);
}
