import { useState } from 'react';
import GameLayout from '../../components/GameLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ShareButton from '../../components/ShareButton';
import { usePuzzle } from '../../hooks/usePuzzle';
import { useAuth } from '../../context/AuthContext';
import { results } from '../../api/client';
import type { ConnectionsPuzzle, ConnectionsCategory } from '../../types';

const COLOR_CLASSES: Record<string, { bg: string; text: string }> = {
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-900' },
  green: { bg: 'bg-green-500', text: 'text-green-900' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-900' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-900' },
};

const MAX_MISTAKES = 4;

export default function ConnectionsPage() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const { data, loading, error, reload } = usePuzzle<ConnectionsPuzzle>('connections', mode);
  const { user } = useAuth();

  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<ConnectionsCategory[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [shake, setShake] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resultLog, setResultLog] = useState<Array<{ correct: boolean; color: string }>>([]);

  const puzzle = data?.puzzle ?? [];
  const allItems = puzzle.flatMap(c => c.items);
  const solvedItems = solved.flatMap(c => c.items);
  const remaining = allItems.filter(item => !solvedItems.includes(item));

  const toggle = (item: string) => {
    if (solved.some(c => c.items.includes(item))) return;
    setSelected(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : prev.length < 4 ? [...prev, item] : prev
    );
  };

  const submit = () => {
    if (selected.length !== 4) return;
    const match = puzzle.find(
      cat => selected.every(s => cat.items.includes(s)) && cat.items.length === 4
    );
    if (match && !solved.includes(match)) {
      const newSolved = [...solved, match];
      setSolved(newSolved);
      setSelected([]);
      setResultLog(prev => [...prev, { correct: true, color: match.color }]);
      if (newSolved.length === 4 && !submitted) {
        setSubmitted(true);
        if (user && data) {
          results.submit({
            gameMode: 'connections',
            puzzleId: data.puzzleId,
            isDaily: data.isDaily,
            attempts: mistakes + newSolved.length,
            score: Math.max(0, 1000 - mistakes * 200),
          }).catch(() => null);
        }
      }
    } else {
      setResultLog(prev => [...prev, { correct: false, color: 'red' }]);
      setMistakes(m => m + 1);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (mistakes + 1 >= MAX_MISTAKES) setSubmitted(true);
    }
  };

  const shareText = () => {
    const rows = resultLog.map(r => {
      const map: Record<string, string> = { yellow: '🟨', green: '🟩', blue: '🟦', purple: '🟪', red: '🟥' };
      return map[r.color] ?? '⬜';
    });
    return `LoL Connections ${data?.isDaily ? '(Daily)' : '(Practice)'}\n${rows.join('')}\n${solved.length}/4 solved · ${mistakes} mistakes\nlolhub.gg/connections`;
  };

  const handleModeChange = (m: 'daily' | 'practice') => {
    setMode(m);
    setSelected([]);
    setSolved([]);
    setMistakes(0);
    setSubmitted(false);
    setResultLog([]);
    reload();
  };

  if (loading) return (
    <GameLayout title="Connections" description="" mode={mode} onModeChange={handleModeChange}>
      <LoadingSpinner />
    </GameLayout>
  );

  if (error) return (
    <GameLayout title="Connections" description="" mode={mode} onModeChange={handleModeChange}>
      <p className="text-red-400 text-center py-8">{error}</p>
    </GameLayout>
  );

  const gameOver = submitted || mistakes >= MAX_MISTAKES;

  return (
    <GameLayout
      title="Connections"
      description="Find 4 groups of 4. Select 4 items that share a theme."
      mode={mode}
      onModeChange={handleModeChange}
    >
      {/* Solved categories */}
      <div className="flex flex-col gap-2">
        {solved.map(cat => {
          const colors = COLOR_CLASSES[cat.color];
          return (
            <div key={cat.category} className={`${colors.bg} ${colors.text} rounded-lg p-3 text-center font-bold`}>
              <div className="text-sm uppercase tracking-wider opacity-75 mb-1">{cat.category}</div>
              <div className="text-sm">{cat.items.join(', ')}</div>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      {!gameOver && remaining.length > 0 && (
        <div className={`grid grid-cols-4 gap-2 ${shake ? 'animate-bounce' : ''}`}>
          {remaining.map(item => (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`p-3 rounded-lg text-sm font-semibold text-center transition-all duration-100 min-h-[60px] flex items-center justify-center leading-tight ${
                selected.includes(item)
                  ? 'bg-gold text-navy scale-95'
                  : 'bg-navy-card border border-gold/20 text-gold-light hover:border-gold/50 hover:bg-gold/10'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {/* Mistakes */}
      <div className="flex items-center gap-2 text-sm text-gold/60">
        <span>Mistakes:</span>
        {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${i < mistakes ? 'bg-red-500' : 'bg-gold/20'}`}
          />
        ))}
      </div>

      {/* Controls */}
      {!gameOver && (
        <div className="flex gap-2">
          <button
            className="btn-secondary flex-1"
            onClick={() => setSelected([])}
            disabled={selected.length === 0}
          >
            Deselect All
          </button>
          <button
            className="btn-primary flex-1"
            onClick={submit}
            disabled={selected.length !== 4}
          >
            Submit
          </button>
        </div>
      )}

      {/* Game over */}
      {gameOver && (
        <div className="card text-center flex flex-col gap-3">
          <p className="text-gold font-bold text-lg">
            {solved.length === 4 ? '🏆 Solved!' : `Game Over · ${solved.length}/4 correct`}
          </p>
          {solved.length < 4 && (
            <div className="text-gold/60 text-sm">
              {puzzle.filter(c => !solved.includes(c)).map(c => (
                <p key={c.category}><strong>{c.category}:</strong> {c.items.join(', ')}</p>
              ))}
            </div>
          )}
          <div className="flex gap-2 justify-center flex-wrap">
            <ShareButton text={shareText()} />
            <button className="btn-secondary" onClick={() => handleModeChange(mode)}>Play Again</button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
