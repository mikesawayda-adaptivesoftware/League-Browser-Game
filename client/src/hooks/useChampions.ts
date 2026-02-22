import { useState, useEffect } from 'react';
import type { Champion } from '../types';

let cache: Champion[] | null = null;

export function useChampions() {
  const [champions, setChampions] = useState<Champion[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    fetch('/data/champions.json')
      .then(r => r.json())
      .then((data: Champion[]) => {
        cache = data;
        setChampions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { champions, loading };
}
