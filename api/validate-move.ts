import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ValidateMoveRequest } from '../src/types/game';
import { validateAction } from '../src/game/gameLogic';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { currentState, action } = req.body as ValidateMoveRequest;

  if (!currentState || !action) {
    return res.status(400).json({ error: 'Missing currentState or action' });
  }

  try {
    const result = validateAction(currentState, action);
    return res.status(200).json(result);
  } catch (err) {
    console.error('Validate move error:', err);
    return res.status(500).json({ error: 'Internal validation error' });
  }
}
