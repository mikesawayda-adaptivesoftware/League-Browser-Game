import { useState, useEffect } from 'react';
import { leaderboard as leaderboardApi } from '../api/client';
import type { LeaderboardEntry } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const MODES = [
  { id: 'connections', label: 'Connections' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'draft', label: 'Draft' },
  { id: 'lore', label: 'Lore' },
  { id: 'ability-sound', label: 'Ability Sound' },
  { id: 'patch-note', label: 'Patch Note' },
];

export default function LeaderboardPage() {
  const [mode, setMode] = useState('connections');
  const [daily, setDaily] = useState(true);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    leaderboardApi.get(mode, { daily }).then(data => {
      setEntries(data as LeaderboardEntry[]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [mode, daily]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gold">Leaderboard</h1>

      <div className="flex flex-wrap gap-2">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              mode === m.id ? 'bg-gold text-navy' : 'btn-secondary'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={() => setDaily(true)} className={daily ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>
          Daily
        </button>
        <button onClick={() => setDaily(false)} className={!daily ? 'btn-primary text-sm' : 'btn-secondary text-sm'}>
          All Time
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-gold/20">
              <tr className="text-gold/60 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Player</th>
                <th className="text-right px-4 py-3">Score</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">Attempts</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-gold/40">No results yet</td></tr>
              )}
              {entries.map((e) => (
                <tr key={`${e.rank}-${e.username}`} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                  <td className="px-4 py-3 text-gold/60">{e.rank}</td>
                  <td className="px-4 py-3 text-gold-light font-medium">{e.username}</td>
                  <td className="px-4 py-3 text-right text-gold font-bold">{e.score}</td>
                  <td className="px-4 py-3 text-right text-gold/60 hidden sm:table-cell">{e.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
