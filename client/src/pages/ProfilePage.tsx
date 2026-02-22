import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { user as userApi } from '../api/client';
import type { GameStats } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { Navigate } from 'react-router-dom';

const MODE_LABELS: Record<string, string> = {
  connections: 'Connections',
  timeline: 'Champion Timeline',
  draft: 'Draft Puzzle',
  lore: 'Lore Connections',
  'ability-sound': 'Ability Sound',
  'patch-note': 'Patch Note',
};

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<GameStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    userApi.stats().then((data: GameStats[]) => { setStats(data); setLoading(false); }).catch(() => setLoading(false));
  }, [user]);

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gold">Profile</h1>
          <p className="text-gold/60 text-sm">{user.email}</p>
        </div>
        <button onClick={logout} className="btn-secondary text-sm">Sign Out</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {stats.map(s => (
            <div key={s.gameMode} className="card">
              <h3 className="font-bold text-gold mb-3">{MODE_LABELS[s.gameMode] ?? s.gameMode}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gold/50 text-xs">Total Played</div>
                  <div className="text-gold-light font-bold">{s.totalPlayed}</div>
                </div>
                <div>
                  <div className="text-gold/50 text-xs">Daily Played</div>
                  <div className="text-gold-light font-bold">{s.dailyPlayed}</div>
                </div>
                <div>
                  <div className="text-gold/50 text-xs">Best Score</div>
                  <div className="text-gold font-bold">{s.bestScore ?? '—'}</div>
                </div>
                <div>
                  <div className="text-gold/50 text-xs">Avg Score</div>
                  <div className="text-gold-light font-bold">{s.avgScore ?? '—'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
