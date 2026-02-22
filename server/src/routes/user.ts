import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

router.get('/stats', requireAuth, async (req: AuthRequest, res) => {
  try {
    const results = await prisma.gameResult.findMany({
      where: { userId: req.uid! },
      orderBy: { completedAt: 'desc' },
    });

    const modes = ['connections', 'timeline', 'draft', 'lore', 'ability-sound', 'patch-note'];
    const stats = modes.map((mode) => {
      const modeResults = results.filter((r) => r.gameMode === mode);
      const dailyResults = modeResults.filter((r) => r.isDaily);
      const scores = modeResults.map((r) => r.score);
      return {
        gameMode: mode,
        totalPlayed: modeResults.length,
        dailyPlayed: dailyResults.length,
        bestScore: scores.length ? Math.max(...scores) : null,
        avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
        lastPlayed: modeResults[0]?.completedAt ?? null,
      };
    });

    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

export default router;
