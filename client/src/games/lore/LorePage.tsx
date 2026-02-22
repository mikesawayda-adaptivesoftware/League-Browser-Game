import { useState, useEffect } from 'react';
import GameLayout from '../../components/GameLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ShareButton from '../../components/ShareButton';
import ChampionSearch from '../../components/ChampionSearch';
import { usePuzzle } from '../../hooks/usePuzzle';
import { useChampions } from '../../hooks/useChampions';
import { useAuth } from '../../context/AuthContext';
import { results } from '../../api/client';
import type { LorePuzzle, LoreGraph, Champion } from '../../types';

/** BFS to find shortest path between two nodes in the lore graph */
function bfs(graph: LoreGraph, start: string, end: string): string[] | null {
  if (start === end) return [start];
  const queue: string[][] = [[start]];
  const visited = new Set<string>([start]);
  while (queue.length > 0) {
    const path = queue.shift()!;
    const node = path[path.length - 1];
    for (const neighbor of graph[node] ?? []) {
      if (visited.has(neighbor)) continue;
      const newPath = [...path, neighbor];
      if (neighbor === end) return newPath;
      visited.add(neighbor);
      queue.push(newPath);
    }
  }
  return null;
}

export default function LorePage() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const { data, loading, error, reload } = usePuzzle<LorePuzzle>('lore', mode);
  const { champions } = useChampions();
  const { user } = useAuth();

  const [graph, setGraph] = useState<LoreGraph>({});
  const [chain, setChain] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [shortestPath, setShortestPath] = useState<string[] | null>(null);

  useEffect(() => {
    fetch('/data/lore-graph.json')
      .then(r => r.json())
      .then((g: LoreGraph) => setGraph(g))
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (data?.puzzle) {
      setChain([data.puzzle.championA]);
      setSubmitted(false);
      setShortestPath(null);
    }
  }, [data]);

  const puzzle = data?.puzzle;
  const done = chain.length > 0 && chain[chain.length - 1] === puzzle?.championB;

  const addToChain = (champ: Champion) => {
    if (submitted || chain.includes(champ.name)) return;
    const last = chain[chain.length - 1];
    if (last && !graph[last]?.includes(champ.name)) return;
    setChain(prev => [...prev, champ.name]);
  };

  const submit = () => {
    if (!puzzle) return;
    const optimal = bfs(graph, puzzle.championA, puzzle.championB);
    setShortestPath(optimal);
    setSubmitted(true);
    const isOptimal = optimal && chain.length === optimal.length;
    const chainScore = isOptimal ? 1000 : Math.max(0, 1000 - (chain.length - (optimal?.length ?? chain.length)) * 150);
    if (user && data) {
      results.submit({
        gameMode: 'lore',
        puzzleId: data.puzzleId,
        isDaily: data.isDaily,
        attempts: chain.length,
        score: done ? chainScore : 0,
      }).catch(() => null);
    }
  };

  const shareText = () => {
    if (!data || !puzzle) return '';
    const steps = chain.length - 1;
    const optimal = shortestPath ? shortestPath.length - 1 : '?';
    return `LoL Lore Connections ${data.isDaily ? '(Daily)' : '(Practice)'}\n${puzzle.championA} → ${puzzle.championB}\nSolved in ${steps} steps (optimal: ${optimal})\nlolhub.gg/lore`;
  };

  const handleModeChange = (m: 'daily' | 'practice') => {
    setMode(m);
    setChain([]);
    setSubmitted(false);
    setShortestPath(null);
    reload();
  };

  const lastInChain = chain[chain.length - 1];
  const neighbors = graph[lastInChain] ?? [];
  const available = champions.filter(c =>
    neighbors.includes(c.name) && !chain.includes(c.name) && c.name !== puzzle?.championA
  );

  if (loading) return (
    <GameLayout title="Lore Connections" description="" mode={mode} onModeChange={handleModeChange}>
      <LoadingSpinner />
    </GameLayout>
  );

  if (error) return (
    <GameLayout title="Lore Connections" description="" mode={mode} onModeChange={handleModeChange}>
      <p className="text-red-400 text-center py-8">{error}</p>
    </GameLayout>
  );

  return (
    <GameLayout
      title="Lore Connections"
      description="Find the shortest lore path between the two champions."
      mode={mode}
      onModeChange={handleModeChange}
    >
      {/* Endpoints */}
      {puzzle && (
        <div className="flex items-center justify-between gap-4">
          <div className="card flex-1 text-center">
            <div className="text-xs text-gold/50 uppercase mb-1">Start</div>
            <div className="text-gold font-bold">{puzzle.championA}</div>
          </div>
          <div className="text-gold text-2xl">→</div>
          <div className="card flex-1 text-center">
            <div className="text-xs text-gold/50 uppercase mb-1">End</div>
            <div className="text-gold font-bold">{puzzle.championB}</div>
          </div>
        </div>
      )}

      {/* Chain display */}
      <div className="card">
        <div className="flex items-center gap-2 flex-wrap">
          {chain.map((name, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                name === puzzle?.championA || name === puzzle?.championB
                  ? 'bg-gold text-navy'
                  : 'bg-gold/20 text-gold-light'
              }`}>
                {name}
              </span>
              {i < chain.length - 1 && <span className="text-gold/40">→</span>}
            </span>
          ))}
          {!done && !submitted && (
            <span className="px-3 py-1 rounded-full text-sm border border-dashed border-gold/20 text-gold/30">
              ?
            </span>
          )}
        </div>
      </div>

      {/* Add next champion */}
      {!done && !submitted && available.length > 0 && (
        <div>
          <p className="text-gold/50 text-xs mb-2">Champions connected to <strong className="text-gold">{lastInChain}</strong> in lore:</p>
          <ChampionSearch
            champions={available}
            onSelect={addToChain}
            placeholder="Add next champion in the chain…"
          />
        </div>
      )}

      {!done && !submitted && available.length === 0 && chain.length > 1 && (
        <p className="text-red-400 text-sm text-center">Dead end! No lore connections from {lastInChain} lead forward.</p>
      )}

      {/* Submit / Result */}
      {done && !submitted && (
        <button className="btn-primary" onClick={submit}>
          Submit Chain ({chain.length - 1} steps)
        </button>
      )}

      {submitted && (
        <div className="card flex flex-col gap-3">
          <p className="text-gold font-bold">
            {done
              ? `✅ Connected in ${chain.length - 1} steps!`
              : '❌ Incomplete chain'}
          </p>
          {shortestPath && (
            <div>
              <p className="text-gold/50 text-xs uppercase tracking-wider mb-1">Optimal path ({shortestPath.length - 1} steps):</p>
              <div className="flex items-center gap-2 flex-wrap text-sm text-gold-light">
                {shortestPath.join(' → ')}
              </div>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {done && <ShareButton text={shareText()} />}
            <button className="btn-secondary" onClick={() => handleModeChange(mode)}>Play Again</button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
