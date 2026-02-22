import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// Called by client immediately after Firebase sign-in to ensure a Prisma User record exists
router.post('/sync', requireAuth, async (req: AuthRequest, res) => {
  const { username, email } = req.body as { username?: string; email?: string };
  const uid = req.uid!;

  try {
    const user = await prisma.user.upsert({
      where: { firebaseUid: uid },
      update: {},
      create: {
        firebaseUid: uid,
        username: username ?? `player_${uid.slice(0, 8)}`,
        email: email ?? '',
      },
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { firebaseUid: req.uid! } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
