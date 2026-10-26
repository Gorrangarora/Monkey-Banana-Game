/**
 * Frontend API service — communicates with Vercel serverless functions.
 * Uses relative paths so it works both locally (via Vite proxy) and in production.
 */

import type {
  GameState,
  Algorithm,
  SolveResponse,
  ValidateMoveResponse,
  HealthResponse,
  Action,
} from '../types/game';

// The planner is also importable directly from the frontend module
// so we can fall back to in-browser solving if the API fails.
import { solve as localSolve } from '../ai/planner';
import { validateAction as localValidate } from '../game/gameLogic';

const API_BASE = '/api';

async function fetchJson<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorBody.error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function checkHealth(): Promise<HealthResponse> {
  try {
    return await fetchJson<HealthResponse>(`${API_BASE}/health`);
  } catch {
    return { status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' };
  }
}

export async function solveGame(
  initialState: GameState,
  algorithm: Algorithm,
  maxStates = 500
): Promise<SolveResponse> {
  // First try the API, then fall back to in-browser computation
  try {
    return await fetchJson<SolveResponse>(`${API_BASE}/solve`, {
      method: 'POST',
      body: JSON.stringify({ initialState, algorithm, maxStates }),
    });
  } catch (err) {
    console.warn('API unavailable, using local solver:', err);
    // Local fallback — same algorithm, same logic
    return localSolve(initialState, algorithm, maxStates);
  }
}

export async function validateMove(
  currentState: GameState,
  action: Action
): Promise<ValidateMoveResponse> {
  try {
    return await fetchJson<ValidateMoveResponse>(`${API_BASE}/validate-move`, {
      method: 'POST',
      body: JSON.stringify({ currentState, action }),
    });
  } catch {
    // Local fallback
    return localValidate(currentState, action);
  }
}
