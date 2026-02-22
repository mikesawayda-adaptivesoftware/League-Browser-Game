import 'dotenv/config';
import { initFirebase } from './lib/firebase.js';
initFirebase();
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import puzzleRoutes from './routes/puzzle.js';
import resultRoutes from './routes/result.js';
import leaderboardRoutes from './routes/leaderboard.js';
import userRoutes from './routes/user.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/puzzle', puzzleRoutes);
app.use('/api/result', resultRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/user', userRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
