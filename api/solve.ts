import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { SolveRequest, GameState } from '../src/types/game';
import { solve } from '../src/ai/planner';
import { POSITIONS } from '../src/game/gameLogic';

function isValidPosition(p: unknown): boolean {
  return typeof p === 'string' && (POSITIONS as string[]).includes(p);
}

function isValidState(s: unknown): s is GameState {
  if (!s || typeof s !== 'object') return false;
  const state = s as Record<string, unknown>;
  return (
    isValidPosition(state.monkeyPosition) &&
    isValidPosition(state.boxPosition) &&
    isValidPosition(state.bananaPosition) &&
    typeof state.monkeyOnBox === 'boolean' &&
    typeof state.hasBanana === 'boolean'
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body as SolveRequest;

  if (!isValidState(body?.initialState)) {
    return res.status(400).json({ error: 'Invalid or missing initialState' });
  }

  const algorithm = body.algorithm === 'DFS' ? 'DFS' : 'BFS';
  const maxStates = Math.min(Math.max(Number(body.maxStates) || 500, 10), 2000);

  try {
    const result = solve(body.initialState, algorithm, maxStates);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Solver error:', err);
    return res.status(500).json({ error: 'Internal solver error' });
  }
}
