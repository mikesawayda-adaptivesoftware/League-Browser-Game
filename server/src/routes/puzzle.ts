import { Router } from 'express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getDailyIndex, getDailyPuzzleId } from '../services/puzzleService.js';

const router = Router();
const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');

function loadData<T>(filename: string): T {
  const raw = readFileSync(join(dataDir, filename), 'utf-8');
  return JSON.parse(raw) as T;
}

const GAME_DATA_FILES: Record<string, string> = {
  connections: 'connections-puzzles.json',
  timeline: 'timeline-puzzles.json',
  draft: 'draft-puzzles.json',
  lore: 'lore-puzzles.json',
  'ability-sound': 'ability-sound-puzzles.json',
  'patch-note': 'patch-puzzles.json',
};

router.get('/:game/daily', (req, res) => {
  const { game } = req.params;
  const file = GAME_DATA_FILES[game];
  if (!file) {
    res.status(404).json({ error: 'Unknown game mode' });
    return;
  }
  try {
    const puzzles = loadData<unknown[]>(file);
    const idx = getDailyIndex(game, puzzles.length);
    const puzzleId = getDailyPuzzleId(game);
    res.json({ puzzleId, isDaily: true, puzzle: puzzles[idx] });
  } catch {
    res.status(500).json({ error: 'Failed to load puzzle data' });
  }
});

router.get('/:game/random', (req, res) => {
  const { game } = req.params;
  const file = GAME_DATA_FILES[game];
  if (!file) {
    res.status(404).json({ error: 'Unknown game mode' });
    return;
  }
  try {
    const puzzles = loadData<unknown[]>(file);
    const idx = Math.floor(Math.random() * puzzles.length);
    res.json({ puzzleId: `${game}-practice-${idx}`, isDaily: false, puzzle: puzzles[idx] });
  } catch {
    res.status(500).json({ error: 'Failed to load puzzle data' });
  }
});

export default router;
