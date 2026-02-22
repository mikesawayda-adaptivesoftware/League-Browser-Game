import { createHash } from 'crypto';

/**
 * Deterministically picks a puzzle index for a given date and game mode.
 * No cron job needed — same date always returns same puzzle.
 */
export function getDailyIndex(gameMode: string, poolSize: number, date?: Date): number {
  const d = date ?? new Date();
  const dateStr = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  const hash = createHash('sha256').update(`${gameMode}:${dateStr}`).digest('hex');
  const num = parseInt(hash.slice(0, 8), 16);
  return num % poolSize;
}

export function getDailyPuzzleId(gameMode: string, date?: Date): string {
  const d = date ?? new Date();
  const dateStr = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  return `${gameMode}-${dateStr}`;
}
