import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const { gameMode, puzzleId, isDaily, attempts, score } = req.body as {
    gameMode: string;
    puzzleId: string;
    isDaily: boolean;
    attempts: number;
    score: number;
  };

  if (!gameMode || !puzzleId || score == null) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // Prevent duplicate daily submissions
    if (isDaily) {
      const existing = await prisma.gameResult.findFirst({
        where: { userId: req.uid!, puzzleId, isDaily: true },
      });
      if (existing) {
        res.status(409).json({ error: 'Already submitted for this daily puzzle' });
        return;
      }
    }

    const result = await prisma.gameResult.create({
      data: {
        userId: req.uid!,
        gameMode,
        puzzleId,
        isDaily,
        attempts,
        score,
      },
    });
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

export default router;
