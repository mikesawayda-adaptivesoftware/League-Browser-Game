import { useState, useRef } from 'react';
import GameLayout from '../../components/GameLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ShareButton from '../../components/ShareButton';
import ChampionSearch from '../../components/ChampionSearch';
import { usePuzzle } from '../../hooks/usePuzzle';
import { useChampions } from '../../hooks/useChampions';
import { useAuth } from '../../context/AuthContext';
import { results } from '../../api/client';
import type { AbilitySoundPuzzle } from '../../types';

const MAX_GUESSES = 5;
const SCORE_PER_GUESS = [1000, 800, 600, 400, 200];
const ABILITY_LABELS: Record<string, string> = { Q: 'Q', W: 'W', E: 'E', R: 'Ultimate', P: 'Passive' };

export default function AbilitySoundPage() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const { data, loading, error, reload } = usePuzzle<AbilitySoundPuzzle>('ability-sound', mode);
  const { champions } = useChampions();
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [playing, setPlaying] = useState(false);

  const puzzle = data?.puzzle;
  const gameOver = won || guesses.length >= MAX_GUESSES;

  const playSound = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => null);
  };

  const handleGuess = (name: string) => {
    if (gameOver || guesses.includes(name)) return;
    const newGuesses = [...guesses, name];
    setGuesses(newGuesses);
    if (name.toLowerCase() === puzzle?.champion.toLowerCase()) {
      setWon(true);
      setSubmitted(true);
      if (user && data) {
        results.submit({
          gameMode: 'ability-sound',
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
          gameMode: 'ability-sound',
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
    const emojis = guesses.map(g => g.toLowerCase() === puzzle?.champion.toLowerCase() ? '🟩' : '🟥').join('');
    return `LoL Ability Sound ${data.isDaily ? '(Daily)' : '(Practice)'}\n${emojis}\nlolhub.gg/ability-sound`;
  };

  const handleModeChange = (m: 'daily' | 'practice') => {
    setMode(m);
    setGuesses([]);
    setWon(false);
    setSubmitted(false);
    setPlaying(false);
    reload();
  };

  if (loading) return (
    <GameLayout title="Ability Sound" description="" mode={mode} onModeChange={handleModeChange}>
      <LoadingSpinner />
    </GameLayout>
  );

  if (error) return (
    <GameLayout title="Ability Sound" description="" mode={mode} onModeChange={handleModeChange}>
      <p className="text-red-400 text-center py-8">{error}</p>
    </GameLayout>
  );

  return (
    <GameLayout
      title="Ability Sound"
      description="Listen to the ability sound and guess the champion."
      mode={mode}
      onModeChange={handleModeChange}
    >
      {puzzle && (
        <audio
          ref={audioRef}
          src={`/sounds/${puzzle.audioFile}`}
          onEnded={() => setPlaying(false)}
        />
      )}

      {/* Player */}
      <div className="card flex flex-col items-center gap-4 py-8">
        <button
          onClick={playSound}
          className={`w-20 h-20 rounded-full border-2 border-gold flex items-center justify-center transition-all ${
            playing ? 'bg-gold/20 scale-95' : 'hover:bg-gold/10'
          }`}
          aria-label="Play sound"
        >
          {playing ? (
            <span className="flex gap-1">
              {[1, 2, 3].map(i => (
                <span key={i} className="w-1 h-5 bg-gold rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </span>
          ) : (
            <svg className="w-8 h-8 text-gold ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <p className="text-gold/50 text-sm">Click to play the ability sound</p>
        {puzzle?.hint && guesses.length >= 2 && (
          <p className="text-gold/60 text-sm italic">Hint: {puzzle.hint}</p>
        )}
      </div>

      {/* Guesses */}
      <div className="flex flex-col gap-1">
        {guesses.map((g, i) => {
          const correct = g.toLowerCase() === puzzle?.champion.toLowerCase();
          return (
            <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${correct ? 'bg-green-600/20 border border-green-500/30' : 'bg-red-600/10 border border-red-500/20'}`}>
              <span className={correct ? 'text-green-400' : 'text-red-400'}>{correct ? '✓' : '✗'}</span>
              <span className="text-gold-light">{g}</span>
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
        />
      )}

      {/* Result */}
      {gameOver && puzzle && (
        <div className="card text-center flex flex-col gap-3">
          <div className="flex items-center justify-center gap-3">
            {champions.find(c => c.name.toLowerCase() === puzzle.champion.toLowerCase()) && (
              <img
                src={champions.find(c => c.name.toLowerCase() === puzzle.champion.toLowerCase())!.imageUrl}
                alt={puzzle.champion}
                className="w-12 h-12 rounded-full border-2 border-gold"
              />
            )}
            <div>
              <p className="text-gold font-bold text-lg">
                {won ? '🎵 Correct!' : `It was ${puzzle.champion}`}
              </p>
              <p className="text-gold/50 text-sm">{ABILITY_LABELS[puzzle.ability] ?? puzzle.ability} ability</p>
            </div>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <ShareButton text={shareText()} />
            <button className="btn-secondary" onClick={() => handleModeChange(mode)}>Play Again</button>
          </div>
        </div>
      )}
    </GameLayout>
  );
}
