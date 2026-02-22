import { useState } from 'react';
import GameLayout from '../../components/GameLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ShareButton from '../../components/ShareButton';
import ChampionSearch from '../../components/ChampionSearch';
import { usePuzzle } from '../../hooks/usePuzzle';
import { useChampions } from '../../hooks/useChampions';
import { useAuth } from '../../context/AuthContext';
import { results } from '../../api/client';
import type { PatchNotePuzzle } from '../../types';

const MAX_GUESSES = 5;
const SCORE_PER_GUESS = [1000, 800, 600, 400, 200];

export default function PatchNotePage() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const { data, loading, error, reload } = usePuzzle<PatchNotePuzzle>('patch-note', mode);
  const { champions } = useChampions();
  const { user } = useAuth();

  const [guesses, setGuesses] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const puzzle = data?.puzzle;
  const gameOver = won || guesses.length >= MAX_GUESSES;

  const handleGuess = (name: string) => {
    if (gameOver || guesses.includes(name)) return;
    const newGuesses = [...guesses, name];
    setGuesses(newGuesses);
    if (name.toLowerCase() === puzzle?.answer.toLowerCase()) {
      setWon(true);
      setSubmitted(true);
      if (user && data) {
        results.submit({
          gameMode: 'patch-note',
          puzzleId: data.puzzleId,
          isDaily: data.isDaily,
          attempts: newGuesses.length,
          score: SCORE_PER_GUESS[newGuesses.length - 1] ?? 0,
        }).catch(() => null);
      }
    } else if (newGuesses.length >= MAX_GUESSES && !submitted) {
      setSubmitted(true);
      if (user && data) {
        results.submit({
          gameMode: 'patch-note',
          puzzleId: data.puzzleId,
          isDaily: data.isDaily,
          attempts: newGuesses.length,
          score: 0,
        }).catch(() => null);
      }
    }
  };

  const shareText = () => {
    if (!data) return '';
    const emojis = guesses.map(g => g.toLowerCase() === puzzle?.answer.toLowerCase() ? '🟩' : '🟥').join('');
    return `LoL Patch Note ${data.isDaily ? '(Daily)' : '(Practice)'}\nPatch ${puzzle?.patch}\n${emojis}\nlolhub.gg/patch-note`;
  };

  const handleModeChange = (m: 'daily' | 'practice') => {
    setMode(m);
    setGuesses([]);
    setWon(false);
    setSubmitted(false);
    reload();
  };

  // Redact answer name in excerpt
  const redactedExcerpt = puzzle?.excerpt.replace(
    new RegExp(puzzle.answer, 'gi'),
    '█'.repeat(puzzle.answer.length)
  ) ?? '';

  if (loading) return (
    <GameLayout title="Patch Note" description="" mode={mode} onModeChange={handleModeChange}>
      <LoadingSpinner />
    </GameLayout>
  );

  if (error) return (
    <GameLayout title="Patch Note" description="" mode={mode} onModeChange={handleModeChange}>
      <p className="text-red-400 text-center py-8">{error}</p>
    </GameLayout>
  );

  return (
    <GameLayout
      title="Patch Note"
      description="Guess which champion or item was changed based on the patch note."
      mode={mode}
      onModeChange={handleModeChange}
    >
      {/* Patch note display */}
      <div className="card border-gold/40">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gold/50 uppercase tracking-widest">Patch {puzzle?.patch}</span>
          <span className="text-xs text-gold/30">·</span>
          <span className="text-xs text-gold/50 capitalize">{puzzle?.type}</span>
        </div>
        <blockquote className="font-mono text-sm text-gold-light leading-relaxed whitespace-pre-wrap border-l-2 border-gold/30 pl-4">
          {redactedExcerpt}
        </blockquote>
      </div>

      {/* Guesses */}
      <div className="flex flex-col gap-1">
        {guesses.map((g, i) => {
          const correct = g.toLowerCase() === puzzle?.answer.toLowerCase();
          return (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${correct ? 'bg-green-600/20 border border-green-500/30' : 'bg-red-600/10 border border-red-500/20'}`}>
              <span className={correct ? 'text-green-400' : 'text-red-400'}>{correct ? '✓' : '✗'}</span>
              <span className="text-gold-light">{g}</span>
              {correct && <span className="text-green-400 ml-auto text-xs">Correct!</span>}
            </div>
          );
        })}
        {Array.from({ length: MAX_GUESSES - guesses.length }).map((_, i) => (
          <div key={i} className="h-9 rounded border border-gold/10 bg-gold/5" />
        ))}
      </div>

      {/* Input */}
      {!gameOver && (
        <ChampionSearch
          champions={champions}
          onSelect={c => handleGuess(c.name)}
          placeholder={`Guess ${guesses.length + 1}/${MAX_GUESSES}…`}
          exclude={[]}
        />
      )}

      {/* Result */}
      {gameOver && (
        <div className="card text-center flex flex-col gap-3">
          <p className="text-gold font-bold text-lg">
            {won ? `🎉 Correct! · Patch ${puzzle?.patch}` : `The answer was: ${puzzle?.answer}`}
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <ShareButton text={shareText()} />
            <button className="btn-secondary" onClick={() => handleModeChange(mode)}>Play Again</button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
