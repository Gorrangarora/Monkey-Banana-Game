import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './styles/main.css';

import GameScene from './components/game/GameScene';
import ControlsBar from './components/controls/ControlsBar';
import PossibilityBar from './components/controls/PossibilityBar';
import ManualControls from './components/controls/ManualControls';
import StateCard from './components/ai/StateCard';
import ThinkingIndicator from './components/ai/ThinkingIndicator';
import ActionLog from './components/ai/ActionLog';
import SearchTree from './components/ai/SearchTree';
import MetricsCard from './components/ai/MetricsCard';
import EducationSection from './components/education/EducationSection';
import { audioService } from './services/audioService';

import type {
  GameState,
  Algorithm,
  AnimationSpeed,
  GameMode,
  PlanningStage,
  PerformanceMetrics,
  SearchNode,
  SearchEdge,
  StateTransition,
  Action,
  Possibility,
  PossibilityId,
} from './types/game';

import { solveGame } from './services/api';
import { validateAction, cloneState, POSITIONS, getActionDirection } from './game/gameLogic';

// ─── Default initial state ──────────────────────────────────────────────────
const DEFAULT_STATE: GameState = {
  monkeyPosition: 'Left',
  boxPosition: 'Center',
  bananaPosition: 'Right',
  monkeyOnBox: false,
  hasBanana: false,
};

// ─── Named Possibilities A, B, C, D ─────────────────────────────────────────
export const POSSIBILITIES: Possibility[] = [
  {
    id: 'A',
    name: 'Possibility A',
    badge: 'Standard Setup',
    state: { monkeyPosition: 'Left', boxPosition: 'Center', bananaPosition: 'Right', monkeyOnBox: false, hasBanana: false },
    description: 'Monkey at Left, Box in Center, Banana at Right.',
    voiceText: 'Possibility A selected. Monkey is at Left, Box is at Center, and Banana is at Right.',
    bfsSteps: 4,
    dfsSteps: 6,
  },
  {
    id: 'B',
    name: 'Possibility B',
    badge: 'Far Distance',
    state: { monkeyPosition: 'Center', boxPosition: 'Left', bananaPosition: 'Right', monkeyOnBox: false, hasBanana: false },
    description: 'Monkey at Center, Box at Left, Banana at Right across the room.',
    voiceText: 'Possibility B selected. Monkey is at Center, Box is at Left, and Banana is at Right.',
    bfsSteps: 5,
    dfsSteps: 7,
  },
  {
    id: 'C',
    name: 'Possibility C',
    badge: 'Reversed Corner',
    state: { monkeyPosition: 'Right', boxPosition: 'Right', bananaPosition: 'Left', monkeyOnBox: false, hasBanana: false },
    description: 'Monkey and Box together at Right, Banana far at Left.',
    voiceText: 'Possibility C selected. Monkey is at Right, Box is at Right, and Banana is at Left.',
    bfsSteps: 4,
    dfsSteps: 6,
  },
  {
    id: 'D',
    name: 'Possibility D',
    badge: 'Center Banana',
    state: { monkeyPosition: 'Center', boxPosition: 'Right', bananaPosition: 'Center', monkeyOnBox: false, hasBanana: false },
    description: 'Monkey at Center, Box at Right, Banana hanging in Center.',
    voiceText: 'Possibility D selected. Monkey is at Center, Box is at Right, and Banana is at Center.',
    bfsSteps: 4,
    dfsSteps: 6,
  },
];

// Speed → delay mapping in ms
const SPEED_DELAY: Record<AnimationSpeed, number> = {
  slow: 2000,
  normal: 1000,
  fast: 400,
};

// Planning stage delays (simulating actual progress)
const STAGE_SEQUENCE: PlanningStage[] = [
  'analyzing-initial',
  'identifying-goal',
  'generating-actions',
  'exploring-states',
  'finding-solution',
];

type AiTab = 'state' | 'log' | 'tree' | 'metrics';

const App: React.FC = () => {
  // ── Game state ─────────────────────────────────────────────────────────────
  const [initialState] = useState<GameState>(DEFAULT_STATE);
  const [gameState, setGameState] = useState<GameState>(cloneState(DEFAULT_STATE));
  const [stateHistory, setStateHistory] = useState<GameState[]>([cloneState(DEFAULT_STATE)]);

  // ── AI plan ────────────────────────────────────────────────────────────────
  const [plan, setPlan] = useState<StateTransition[]>([]);
  const [searchNodes, setSearchNodes] = useState<SearchNode[]>([]);
  const [searchEdges, setSearchEdges] = useState<SearchEdge[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<GameMode>('manual');
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>('BFS');
  const [speed, setSpeed] = useState<AnimationSpeed>('normal');
  const [showReasoning, setShowReasoning] = useState(true);
  const [showSearchTree, setShowSearchTree] = useState(true);
  const [muted, setMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<AiTab>('state');
  const [isLoading, setIsLoading] = useState(false);
  const [planningStage, setPlanningStage] = useState<PlanningStage>('idle');
  const [currentActionType, setCurrentActionType] = useState<string | undefined>();
  const [currentPossibility, setCurrentPossibility] = useState<PossibilityId>('A');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPausedRef = useRef(false);
  const cancelledRef = useRef(false);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    if (stageTimerRef.current) clearTimeout(stageTimerRef.current);
  }, []);

  const showToastMsg = useCallback((msg: string, type: 'success' | 'error' | 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // ── Execute a single plan step ─────────────────────────────────────────────
  const executeStep = useCallback((stepIdx: number, planToRun: StateTransition[]) => {
    if (stepIdx >= planToRun.length) {
      setIsPlaying(false);
      setMode('celebrating');
      setCurrentStep(planToRun.length);
      setCurrentActionType(undefined);
      setPlanningStage('complete');
      audioService.playVictorySound();
      audioService.speak(`Goal achieved for Possibility ${currentPossibility}! ${algorithm} found the banana in ${planToRun.length} steps.`);
      return;
    }

    const transition = planToRun[stepIdx];
    setCurrentStep(stepIdx);
    setCurrentActionType(transition.action.type);
    setActiveTab('log');

    const fromPos = transition.fromState?.monkeyPosition || transition.action.from;
    const toPos = transition.action.to || transition.action.target;
    const dir = getActionDirection(fromPos, toPos);
    const dirWord = dir ? ` ${dir.toLowerCase()}` : '';

    // Trigger sound & voice for current action with explicit left/right direction
    switch (transition.action.type) {
      case 'WALK':
        audioService.playWalkSound();
        audioService.speak(`Monkey walking${dirWord} to ${toPos || 'next location'}.`);
        break;
      case 'PUSH_BOX':
        audioService.playPushSound();
        audioService.speak(`Pushing the box${dirWord} to ${toPos || 'next location'}!`);
        break;
      case 'CLIMB_BOX':
        audioService.playJumpSound();
        audioService.speak('Jumping onto the box!');
        break;
      case 'DESCEND_BOX':
      case 'CLIMB_DOWN':
        audioService.playJumpSound();
        audioService.speak('Jumping down.');
        break;
      case 'GRAB_BANANA':
        audioService.playBananaGrabSound();
        audioService.speak('Reaching up... Banana grabbed!');
        break;
    }

    // Animate
    setTimeout(() => {
      setGameState(cloneState(transition.toState));
      setStateHistory((h) => [...h, cloneState(transition.toState)]);
      setCurrentActionType(undefined);

      if (cancelledRef.current) return;
      if (isPausedRef.current) {
        setIsPlaying(false);
        return;
      }

      // Schedule next step
      playTimerRef.current = setTimeout(() => {
        if (cancelledRef.current || isPausedRef.current) return;
        executeStep(stepIdx + 1, planToRun);
      }, SPEED_DELAY[speed]);
    }, Math.min(SPEED_DELAY[speed] * 0.5, 600));
  }, [speed]);

  // ── AI Solve ────────────────────────────────────────────────────────────────
  const handleAISolve = useCallback(async () => {
    clearTimers();
    cancelledRef.current = false;
    isPausedRef.current = false;

    setIsLoading(true);
    setMode('ai-solving');
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStep(-1);
    setErrorMsg(null);
    setPlan([]);
    setSearchNodes([]);
    setSearchEdges([]);
    setCurrentActionType(undefined);

    // Reset game to current possibility configuration
    const currentConfig = POSSIBILITIES.find((p) => p.id === currentPossibility) || POSSIBILITIES[0];
    const initState = currentConfig.state;
    setGameState(cloneState(initState));
    setStateHistory([cloneState(initState)]);

    // Voice announcement for AI Solve mentioning possibility and algorithm
    const algName = algorithm === 'BFS' ? 'Breadth-First Search for the optimal shortest path' : 'Depth-First Search with depth exploration';
    audioService.speak(`Solving Possibility ${currentPossibility} using ${algName}.`);

    // Animate planning stages
    let stageIdx = 0;
    const advanceStage = () => {
      if (stageIdx < STAGE_SEQUENCE.length) {
        setPlanningStage(STAGE_SEQUENCE[stageIdx]);
        stageIdx++;
        stageTimerRef.current = setTimeout(advanceStage, 280);
      }
    };
    setPlanningStage('analyzing-initial');
    stageTimerRef.current = setTimeout(advanceStage, 280);

    try {
      const result = await solveGame(initState, algorithm);

      // Show final stages
      setPlanningStage('executing-plan');

      setSearchNodes(result.exploredNodes);
      setSearchEdges(result.edges);
      setMetrics({
        algorithm,
        statesGenerated: result.statesGenerated,
        statesExpanded: result.statesExpanded,
        solutionLength: result.solutionLength,
        planningTimeMs: result.planningTime,
        solutionFound: result.success,
      });

      if (!result.success || result.plan.length === 0) {
        setErrorMsg(result.explanation || 'No solution found.');
        setMode('manual');
        setIsLoading(false);
        setPlanningStage('idle');
        return;
      }

      setPlan(result.plan);
      setIsLoading(false);
      setIsPlaying(true);
      setActiveTab('log');

      // Execute plan
      setTimeout(() => {
        if (cancelledRef.current) return;
        executeStep(0, result.plan);
      }, 600);

    } catch (err) {
      setErrorMsg('Failed to connect to the planner. Please try again.');
      setMode('manual');
      setIsLoading(false);
      setPlanningStage('idle');
    }
  }, [algorithm, clearTimers, currentPossibility, executeStep]);

  // ── Step Forward ────────────────────────────────────────────────────────────
  const handleStepForward = useCallback(() => {
    if (currentStep >= plan.length - 1) return;
    clearTimers();
    isPausedRef.current = true;
    setIsPaused(true);
    setIsPlaying(false);
    setMode('ai-stepping');

    const nextIdx = currentStep + 1;
    const transition = plan[nextIdx];
    setCurrentStep(nextIdx);
    setCurrentActionType(transition.action.type);
    setTimeout(() => {
      setGameState(cloneState(transition.toState));
      setStateHistory((h) => [...h, cloneState(transition.toState)]);
      setCurrentActionType(undefined);
      if (nextIdx === plan.length - 1) {
        setMode('celebrating');
        setCurrentStep(plan.length);
      }
    }, 400);
  }, [currentStep, plan, clearTimers]);

  // ── Step Backward ───────────────────────────────────────────────────────────
  const handleStepBackward = useCallback(() => {
    if (currentStep <= -1) return;
    clearTimers();
    isPausedRef.current = true;
    setIsPaused(true);
    setIsPlaying(false);
    setMode('ai-stepping');

    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);
    // Restore from history
    const currentConfig = POSSIBILITIES.find((p) => p.id === currentPossibility) || POSSIBILITIES[0];
    setStateHistory((h) => {
      const newH = h.slice(0, -1);
      const prevState = newH[newH.length - 1] || currentConfig.state;
      setGameState(cloneState(prevState));
      return newH;
    });
  }, [currentStep, clearTimers, currentPossibility]);

  // ── Pause / Resume ──────────────────────────────────────────────────────────
  const handlePauseResume = useCallback(() => {
    if (isPaused) {
      // Resume
      isPausedRef.current = false;
      setIsPaused(false);
      setIsPlaying(true);
      setMode('ai-solving');
      const nextStep = typeof currentStep === 'number' ? currentStep + 1 : 0;
      if (nextStep <= plan.length - 1) {
        executeStep(nextStep, plan);
      }
    } else {
      // Pause
      clearTimers();
      isPausedRef.current = true;
      setIsPaused(true);
      setIsPlaying(false);
      setMode('ai-stepping');
    }
  }, [isPaused, currentStep, plan, executeStep, clearTimers]);

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    clearTimers();
    cancelledRef.current = true;
    isPausedRef.current = false;

    const currentConfig = POSSIBILITIES.find((p) => p.id === currentPossibility) || POSSIBILITIES[0];
    const initState = currentConfig.state;
    setGameState(cloneState(initState));
    setStateHistory([cloneState(initState)]);
    setPlan([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    setIsPaused(false);
    setMode('manual');
    setPlanningStage('idle');
    setCurrentActionType(undefined);
    setErrorMsg(null);
    setIsLoading(false);

    // Allow new solves
    setTimeout(() => {
      cancelledRef.current = false;
    }, 100);
  }, [clearTimers, currentPossibility]);

  // ── Manual action ───────────────────────────────────────────────────────────
  const handleManualAction = useCallback((action: Action) => {
    if (mode !== 'manual' && mode !== 'celebrating') return;
    if (currentActionType) return;

    const result = validateAction(gameState, action);
    if (result.valid && result.nextState) {
      const next = cloneState(result.nextState);
      setCurrentActionType(action.type);

      const targetPos = action.to || action.target;
      const dir = getActionDirection(gameState.monkeyPosition, targetPos);
      const dirWord = dir ? ` ${dir.toLowerCase()}` : '';

      // Trigger audio & voice narration with direction
      switch (action.type) {
        case 'WALK':
          audioService.playWalkSound();
          audioService.speak(`Walking${dirWord} to ${targetPos || 'destination'}.`);
          break;
        case 'PUSH_BOX':
          audioService.playPushSound();
          audioService.speak(`Pushing the box${dirWord} to ${targetPos || 'destination'}!`);
          break;
        case 'CLIMB_BOX':
          audioService.playJumpSound();
          audioService.speak('Jumping onto the box!');
          break;
        case 'DESCEND_BOX':
        case 'CLIMB_DOWN':
          audioService.playJumpSound();
          audioService.speak('Jumping down.');
          break;
        case 'GRAB_BANANA':
          audioService.playBananaGrabSound();
          audioService.speak('Got the banana! Hooray!');
          break;
      }

      setTimeout(() => {
        setGameState(next);
        setStateHistory((h) => [...h, next]);
        setCurrentActionType(undefined);

        if (next.hasBanana) {
          setMode('celebrating');
          audioService.playVictorySound();
          audioService.speak('Goal achieved! The monkey got the banana!');
          showToastMsg('🎉 Goal achieved! The monkey grabbed the banana!', 'success');
        }
      }, 500);
    } else {
      audioService.playErrorSound();
      audioService.speak(result.explanation);
      showToastMsg(result.explanation, 'error');
    }
  }, [mode, currentActionType, gameState, showToastMsg]);

  // ── Keyboard controls for manual mode ──────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'manual' || currentActionType) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      const pos = gameState.monkeyPosition;
      const onBox = gameState.monkeyOnBox;
      const currentIdx = POSITIONS.indexOf(pos);

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (currentIdx > 0) {
          const targetPos = POSITIONS[currentIdx - 1];
          if (e.shiftKey) {
            handleManualAction({ type: 'PUSH_BOX', target: targetPos, description: `Push box left to ${targetPos}` });
          } else {
            handleManualAction({ type: 'WALK', target: targetPos, description: `Walk left to ${targetPos}` });
          }
        }
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (currentIdx < POSITIONS.length - 1) {
          const targetPos = POSITIONS[currentIdx + 1];
          if (e.shiftKey) {
            handleManualAction({ type: 'PUSH_BOX', target: targetPos, description: `Push box right to ${targetPos}` });
          } else {
            handleManualAction({ type: 'WALK', target: targetPos, description: `Walk right to ${targetPos}` });
          }
        }
      } else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        e.preventDefault();
        if (!onBox) {
          handleManualAction({ type: 'CLIMB_BOX', description: 'Jump onto box' });
        }
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (onBox) {
          handleManualAction({ type: 'CLIMB_DOWN', description: 'Jump down' });
        }
      } else if (e.key === ' ' || e.key.toLowerCase() === 'g' || e.key === 'Enter') {
        e.preventDefault();
        handleManualAction({ type: 'GRAB_BANANA', description: 'Grab banana' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, currentActionType, gameState, handleManualAction]);

  // ── Possibility Selection & Voice Narration ──────────────────────────────
  const handleSelectPossibility = useCallback((id: PossibilityId) => {
    const target = POSSIBILITIES.find((p) => p.id === id);
    if (!target) return;

    clearTimers();
    cancelledRef.current = true;
    setTimeout(() => { cancelledRef.current = false; }, 100);

    setCurrentPossibility(id);
    const newState = cloneState(target.state);
    setGameState(newState);
    setStateHistory([newState]);
    setPlan([]);
    setCurrentStep(-1);
    setIsPlaying(false);
    setIsPaused(false);
    setMode('manual');
    setPlanningStage('idle');
    setSearchNodes([]);
    setSearchEdges([]);
    setMetrics(null);
    setErrorMsg(null);
    setIsLoading(false);

    // Play select chime and speak aloud the selected possibility configuration
    audioService.playSelectSound();
    audioService.speak(target.voiceText);
    showToastMsg(`Loaded ${target.name}: ${target.description}`, 'info');
  }, [clearTimers, showToastMsg]);

  const handleReplayVoice = useCallback((id: PossibilityId) => {
    const target = POSSIBILITIES.find((p) => p.id === id);
    if (!target) return;
    audioService.playSelectSound();
    audioService.speak(target.voiceText);
  }, []);

  const handleAlgorithmChange = useCallback((alg: Algorithm) => {
    setAlgorithm(alg);
    audioService.playSelectSound();
    audioService.speak(
      alg === 'BFS'
        ? 'Breadth-First Search selected. Finds the optimal shortest path.'
        : 'Depth-First Search selected. Explores depth-first branches resulting in a longer path.'
    );
  }, []);

  // ── Cycle to next possibility ───────────────────────────────────────────────
  const handleNewScenario = useCallback(() => {
    const ids: PossibilityId[] = ['A', 'B', 'C', 'D'];
    const curIdx = ids.indexOf(currentPossibility);
    const nextId = ids[(curIdx + 1) % ids.length];
    handleSelectPossibility(nextId);
  }, [currentPossibility, handleSelectPossibility]);

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimers();
      cancelledRef.current = true;
    };
  }, [clearTimers]);

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const TABS: { id: AiTab; label: string; icon: string }[] = [
    { id: 'state', label: 'State', icon: '📊' },
    { id: 'log', label: 'Action Log', icon: '📋' },
    { id: 'tree', label: 'Search Tree', icon: '🌳' },
    { id: 'metrics', label: 'Metrics', icon: '📈' },
  ];

  return (
    <div className="app">
      {/* HEADER */}
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-icon">🐒</span>
          <div>
            <div className="app-logo-text">Monkey &amp; Banana</div>
            <div className="app-logo-sub">AI Planning System — AISC Project</div>
          </div>
        </div>
        <div className="app-header-actions">
          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
            ✓ AI Engine Active
          </span>
          <span className="badge badge-pending" style={{ fontSize: '0.7rem' }}>
            🔊 Voice &amp; Sound FX Enabled
          </span>
          <a
            href="/Monkey_and_Banana_AI_Explanation.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '5px 12px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            title="Download academic PDF report explaining the game and BFS vs DFS"
          >
            📄 PDF Report
          </a>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="main-layout">
        {/* LEFT PANEL — GAME */}
        <div className="game-panel">
          {/* Controls */}
          <ControlsBar
            mode={mode}
            isPlaying={isPlaying}
            isPaused={isPaused}
            speed={speed}
            algorithm={algorithm}
            showReasoning={showReasoning}
            showSearchTree={showSearchTree}
            muted={muted}
            currentStep={currentStep + 1}
            totalSteps={plan.length}
            isLoading={isLoading}
            currentPossibility={currentPossibility}
            onSelectPossibility={handleSelectPossibility}
            onAISolve={handleAISolve}
            onStepForward={handleStepForward}
            onStepBackward={handleStepBackward}
            onPauseResume={handlePauseResume}
            onReset={handleReset}
            onManualMode={() => { handleReset(); setMode('manual'); }}
            onAlgorithmChange={handleAlgorithmChange}
            onSpeedChange={setSpeed}
            onToggleReasoning={() => setShowReasoning((s) => !s)}
            onToggleSearchTree={() => setShowSearchTree((s) => !s)}
            onToggleMute={() => {
              setMuted((m) => {
                const next = !m;
                audioService.setMuted(next);
                return next;
              });
            }}
            onNewScenario={handleNewScenario}
          />

          {/* Error */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  background: 'var(--error-bg)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  color: 'var(--error)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚠️</span>
                <span>{errorMsg}</span>
                <button
                  onClick={() => setErrorMsg(null)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontWeight: 700, fontSize: '1rem' }}
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game scene */}
          <GameScene
            gameState={gameState}
            onAction={handleManualAction}
            isAnimating={!!currentActionType}
            currentActionType={currentActionType}
            mode={mode}
            showToast={showToastMsg}
          />

          {/* Manual mode dedicated controls */}
          {mode === 'manual' && (
            <ManualControls
              gameState={gameState}
              onAction={handleManualAction}
              disabled={!!currentActionType || isPlaying}
            />
          )}

          {/* Current scenario info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 12px',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.75rem',
            color: '#6b7280',
          }}>
            <span>🎯 <strong>Possibility {currentPossibility}</strong></span>
            <span>🐒 Monkey: <strong>{gameState.monkeyPosition}</strong></span>
            <span>📦 Box: <strong>{gameState.boxPosition}</strong></span>
            <span>🍌 Banana: <strong>{gameState.bananaPosition}</strong></span>
            {gameState.hasBanana && <span className="badge badge-success">🏆 Goal Achieved!</span>}
          </div>
        </div>

        {/* RIGHT PANEL — AI DASHBOARD */}
        <div className="ai-panel">
          {/* Tabs */}
          <div className="ai-panel-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="ai-panel-content">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                {/* STATE TAB */}
                {activeTab === 'state' && (
                  <>
                    <StateCard gameState={gameState} mode={mode} algorithm={algorithm} />

                    {/* Thinking indicator */}
                    <ThinkingIndicator stage={planningStage} />

                    {/* Reasoning panel */}
                    {showReasoning && currentStep >= 0 && currentStep < plan.length && (
                      <div className="card">
                        <div className="card-title">
                          <span className="card-title-icon">💡</span>
                          AI Reasoning
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, background: 'var(--ai-bg)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--ai-border)' }}>
                          {plan[currentStep]?.explanation || 'Computing next action…'}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* LOG TAB */}
                {activeTab === 'log' && (
                  <div className="card">
                    <div className="card-title">
                      <span className="card-title-icon">📋</span>
                      Action Log
                      {plan.length > 0 && (
                        <span className="badge badge-pending" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
                          {plan.length} actions
                        </span>
                      )}
                    </div>
                    <ActionLog transitions={plan} currentStep={currentStep} />
                  </div>
                )}

                {/* TREE TAB */}
                {activeTab === 'tree' && showSearchTree && (
                  <div className="card">
                    <div className="card-title">
                      <span className="card-title-icon">🌳</span>
                      State-Space Search Tree
                      {searchNodes.length > 0 && (
                        <span className="badge badge-active" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
                          {searchNodes.length} nodes
                        </span>
                      )}
                    </div>
                    <SearchTree nodes={searchNodes} edges={searchEdges} />
                  </div>
                )}

                {/* METRICS TAB */}
                {activeTab === 'metrics' && (
                  <MetricsCard metrics={metrics} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* All possibilities down to the AI tabs in a narrow line */}
          <div
            className="ai-panel-possibilities-footer"
            style={{
              padding: '8px 12px',
              borderTop: '1px solid var(--ai-border)',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              marginTop: 'auto',
            }}
          >
            <PossibilityBar
              possibilities={POSSIBILITIES}
              currentPossibility={currentPossibility}
              onSelectPossibility={handleSelectPossibility}
              onReplayVoice={handleReplayVoice}
              disabled={isLoading || isPlaying}
            />
          </div>
        </div>
      </main>

      {/* EDUCATIONAL SECTION */}
      <EducationSection />

      {/* GLOBAL TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              background: toast.type === 'error' ? 'var(--error)' : toast.type === 'success' ? 'var(--success)' : 'var(--active)',
              color: 'white',
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.82rem',
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              zIndex: 'var(--z-modal)',
              maxWidth: '360px',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
