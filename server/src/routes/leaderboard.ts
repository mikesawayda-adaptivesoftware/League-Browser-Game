import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

const VALID_MODES = ['connections', 'timeline', 'draft', 'lore', 'ability-sound', 'patch-note'];

router.get('/:game', async (req, res) => {
  const { game } = req.params;
  if (!VALID_MODES.includes(game)) {
    res.status(404).json({ error: 'Unknown game mode' });
    return;
  }

  const limit = Math.min(Number(req.query.limit ?? 20), 100);
  const dailyOnly = req.query.daily === 'true';

  try {
    const results = await prisma.gameResult.findMany({
      where: { gameMode: game, ...(dailyOnly ? { isDaily: true } : {}) },
      orderBy: { score: 'desc' },
      take: limit,
      include: { user: { select: { username: true } } },
    });

    const board = results.map((r, i) => ({
      rank: i + 1,
      username: r.user.username,
      score: r.score,
      attempts: r.attempts,
      completedAt: r.completedAt,
      isDaily: r.isDaily,
    }));

    res.json(board);
  } catch {
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

export default router;
