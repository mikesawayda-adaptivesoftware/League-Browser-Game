import { useState, useEffect } from 'react';
import { puzzle as puzzleApi } from '../api/client';
import type { PuzzleResponse } from '../types';

export function usePuzzle<T>(game: string, mode: 'daily' | 'practice') {
  const [data, setData] = useState<PuzzleResponse<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = mode === 'daily' ? await puzzleApi.daily(game) : await puzzleApi.random(game);
      setData(res as PuzzleResponse<T>);
    } catch {
      setError('Failed to load puzzle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [game, mode]);

  return { data, loading, error, reload: load };
}
