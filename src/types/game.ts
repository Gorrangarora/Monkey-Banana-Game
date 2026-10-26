// Core game state types for the Monkey and Banana Problem

export type Position = 'Left' | 'Center' | 'Right';
export type Algorithm = 'BFS' | 'DFS';
export type ActionType = 'WALK' | 'PUSH_BOX' | 'CLIMB_BOX' | 'DESCEND_BOX' | 'CLIMB_DOWN' | 'GRAB_BANANA';
export type NodeStatus = 'initial' | 'explored' | 'active' | 'goal' | 'rejected' | 'solution-path';

export interface GameState {
  monkeyPosition: Position;
  boxPosition: Position;
  bananaPosition: Position;
  monkeyOnBox: boolean;
  hasBanana: boolean;
}

export interface Action {
  type: ActionType;
  description: string;
  from?: Position;
  to?: Position;
  target?: Position;
}

export interface StateTransition {
  fromState: GameState;
  toState: GameState;
  action: Action;
  explanation: string;
}

export interface SearchNode {
  id: string;
  state: GameState;
  parentId: string | null;
  action: Action | null;
  depth: number;
  status: NodeStatus;
}

export interface SearchEdge {
  fromId: string;
  toId: string;
  action: Action;
}

export interface SolveRequest {
  initialState: GameState;
  algorithm: Algorithm;
  maxStates?: number;
}

export interface SolveResponse {
  success: boolean;
  plan: StateTransition[];
  exploredNodes: SearchNode[];
  edges: SearchEdge[];
  statesGenerated: number;
  statesExpanded: number;
  solutionLength: number;
  planningTime: number;
  explanation: string;
  error?: string;
}

export interface ValidateMoveRequest {
  currentState: GameState;
  action: Action;
}

export interface ValidateMoveResponse {
  valid: boolean;
  nextState?: GameState;
  explanation: string;
  error?: string;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  version: string;
}

// Planning stage for UI display
export type PlanningStage =
  | 'idle'
  | 'analyzing-initial'
  | 'identifying-goal'
  | 'generating-actions'
  | 'exploring-states'
  | 'finding-solution'
  | 'executing-plan'
  | 'verifying-goal'
  | 'complete'
  | 'error';

export interface PlanningProgress {
  stage: PlanningStage;
  stagesCompleted: number;
  totalStages: number;
  message: string;
}

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type GameMode = 'manual' | 'ai-solving' | 'ai-stepping' | 'celebrating';

export interface ControlState {
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
}

export interface PerformanceMetrics {
  algorithm: Algorithm;
  statesGenerated: number;
  statesExpanded: number;
  solutionLength: number;
  planningTimeMs: number;
  solutionFound: boolean;
}

export type PossibilityId = 'A' | 'B' | 'C' | 'D';

export interface Possibility {
  id: PossibilityId;
  name: string;
  badge: string;
  state: GameState;
  description: string;
  voiceText: string;
  bfsSteps: number;
  dfsSteps: number;
}

