import { useState, useEffect } from 'react';
import GameLayout from '../../components/GameLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ShareButton from '../../components/ShareButton';
import { usePuzzle } from '../../hooks/usePuzzle';
import { useChampions } from '../../hooks/useChampions';
import { useAuth } from '../../context/AuthContext';
import { results } from '../../api/client';
import type { DraftPuzzle, Champion } from '../../types';

function ChampionCard({ name, champions, selected, onClick, disabled }: {
  name: string;
  champions: Champion[];
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const champ = champions.find(c => c.name === name);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center gap-1 p-2 rounded-lg transition-all
        ${selected ? 'border-2 border-gold bg-gold/20 scale-95' : 'border border-gold/20 hover:border-gold/50 hover:bg-gold/5'}
        ${disabled ? 'opacity-60 cursor-default' : 'cursor-pointer'}
      `}
    >
      {champ ? (
        <img src={champ.imageUrl} alt={name} className="w-14 h-14 rounded object-cover" />
      ) : (
        <div className="w-14 h-14 rounded bg-navy-card flex items-center justify-center text-2xl">?</div>
      )}
      <span className="text-xs text-gold-light text-center leading-tight font-medium">{name}</span>
    </button>
  );
}

export default function DraftPage() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const { data, loading, error, reload } = usePuzzle<DraftPuzzle>('draft', mode);
  const { champions } = useChampions();
  const { user } = useAuth();

  const [myPicks, setMyPicks] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const puzzle = data?.puzzle;

  useEffect(() => {
    setMyPicks([]);
    setSubmitted(false);
    setScore(0);
  }, [data]);

  const toggle = (name: string) => {
    if (submitted) return;
    setMyPicks(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : prev.length < 5 ? [...prev, name] : prev
    );
  };

  const submit = () => {
    if (!puzzle || myPicks.length !== 5) return;
    const correct = myPicks.filter(p => puzzle.answerComp.includes(p)).length;
    const calculatedScore = Math.round((correct / 5) * 1000);
    setScore(calculatedScore);
    setSubmitted(true);
    if (user && data) {
      results.submit({
        gameMode: 'draft',
        puzzleId: data.puzzleId,
        isDaily: data.isDaily,
        attempts: 1,
        score: calculatedScore,
      }).catch(() => null);
    }
  };

  const shareText = () => {
    if (!data || !puzzle) return '';
    const correct = myPicks.filter(p => puzzle.answerComp.includes(p)).length;
    return `LoL Draft Puzzle ${data.isDaily ? '(Daily)' : '(Practice)'}\n${correct}/5 optimal picks · Score: ${score}\nlolhub.gg/draft`;
  };

  const handleModeChange = (m: 'daily' | 'practice') => {
    setMode(m);
    setMyPicks([]);
    setSubmitted(false);
    setScore(0);
    reload();
  };

  if (loading) return (
    <GameLayout title="Draft Puzzle" description="" mode={mode} onModeChange={handleModeChange}>
      <LoadingSpinner />
    </GameLayout>
  );

  if (error || !puzzle) return (
    <GameLayout title="Draft Puzzle" description="" mode={mode} onModeChange={handleModeChange}>
      <p className="text-red-400 text-center py-8">{error ?? 'Failed to load puzzle'}</p>
    </GameLayout>
  );

  return (
    <GameLayout
      title="Draft Puzzle"
      description="Counter-draft the enemy team. Select 5 champions from the pool."
      mode={mode}
      onModeChange={handleModeChange}
    >
      {/* Enemy comp */}
      <div className="card">
        <h3 className="text-gold/60 text-xs uppercase tracking-widest mb-3">Enemy Team</h3>
        <div className="flex gap-3 flex-wrap justify-center">
          {puzzle.enemyComp.map(name => (
            <ChampionCard key={name} name={name} champions={champions} disabled />
          ))}
        </div>
      </div>

      {/* My picks */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gold/60 text-xs uppercase tracking-widest">Your Team ({myPicks.length}/5)</h3>
          {!submitted && myPicks.length > 0 && (
            <button className="text-xs text-gold/50 hover:text-gold" onClick={() => setMyPicks([])}>Clear</button>
          )}
        </div>
        <div className="flex gap-3 flex-wrap justify-center min-h-[80px]">
          {myPicks.map(name => (
            <ChampionCard key={name} name={name} champions={champions} selected onClick={() => toggle(name)} />
          ))}
          {Array.from({ length: 5 - myPicks.length }).map((_, i) => (
            <div key={i} className="w-[70px] h-[90px] rounded-lg border border-dashed border-gold/20 flex items-center justify-center text-gold/20 text-2xl">
              +
            </div>
          ))}
        </div>
      </div>

      {/* Pool */}
      {!submitted && (
        <div className="card">
          <h3 className="text-gold/60 text-xs uppercase tracking-widest mb-3">Champion Pool</h3>
          <div className="flex gap-2 flex-wrap justify-center">
            {puzzle.pool.map(name => (
              <ChampionCard
                key={name}
                name={name}
                champions={champions}
                selected={myPicks.includes(name)}
                onClick={() => toggle(name)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {submitted && (
        <div className="card">
          <h3 className="text-gold font-bold mb-3">Optimal Answer</h3>
          <div className="flex gap-2 flex-wrap justify-center mb-4">
            {puzzle.answerComp.map(name => (
              <ChampionCard
                key={name}
                name={name}
                champions={champions}
                selected={myPicks.includes(name)}
                disabled
              />
            ))}
          </div>
          <p className="text-gold/60 text-sm italic">{puzzle.explanation}</p>
          <p className="text-gold font-bold text-center mt-3">
            Score: {score} / 1000
          </p>
        </div>
      )}

      {!submitted ? (
        <button className="btn-primary" onClick={submit} disabled={myPicks.length !== 5}>
          Submit Draft ({myPicks.length}/5)
        </button>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <ShareButton text={shareText()} />
          <button className="btn-secondary" onClick={() => handleModeChange(mode)}>Play Again</button>
        </div>
      )}
    </GameLayout>
  );
}
