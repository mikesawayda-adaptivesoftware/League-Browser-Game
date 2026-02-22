export interface Champion {
  id: string;
  name: string;
  title: string;
  roles: string[];
  releaseDate: string; // "YYYY-MM-DD"
  region: string;
  imageUrl: string;
}

export interface PuzzleResponse<T = unknown> {
  puzzleId: string;
  isDaily: boolean;
  puzzle: T;
}

// --- Connections ---
export interface ConnectionsCategory {
  category: string;
  color: 'yellow' | 'green' | 'blue' | 'purple';
  items: string[];
}
export type ConnectionsPuzzle = ConnectionsCategory[];

// --- Timeline ---
export interface TimelineChampion {
  id: string;
  name: string;
  releaseDate: string;
  imageUrl: string;
}
export type TimelinePuzzle = TimelineChampion[];

// --- Draft ---
export interface DraftPuzzle {
  enemyComp: string[];
  answerComp: string[];
  pool: string[];
  explanation: string;
}

// --- Lore ---
export interface LorePuzzle {
  championA: string;
  championB: string;
}

export interface LoreGraph {
  [champion: string]: string[];
}

// --- Ability Sound ---
export interface AbilitySoundPuzzle {
  champion: string;
  ability: string; // Q | W | E | R | P
  audioFile: string;
  hint?: string;
}

// --- Patch Note ---
export interface PatchNotePuzzle {
  excerpt: string;
  answer: string;
  patch: string;
  type: 'champion' | 'item';
}

// --- Leaderboard ---
export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  attempts: number;
  completedAt: string;
  isDaily: boolean;
}

// --- User Stats ---
export interface GameStats {
  gameMode: string;
  totalPlayed: number;
  dailyPlayed: number;
  bestScore: number | null;
  avgScore: number | null;
  lastPlayed: string | null;
}
