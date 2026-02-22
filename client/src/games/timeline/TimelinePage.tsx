import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GameLayout from '../../components/GameLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ShareButton from '../../components/ShareButton';
import { usePuzzle } from '../../hooks/usePuzzle';
import { useAuth } from '../../context/AuthContext';
import { results } from '../../api/client';
import type { TimelinePuzzle, TimelineChampion } from '../../types';

function SortableChampion({ champion, correct, revealed }: { champion: TimelineChampion; correct: boolean | null; revealed: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: champion.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing select-none
        ${isDragging ? 'opacity-50 z-50' : ''}
      `}
    >
      <div className={`
        w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors
        ${!revealed ? 'border-gold/30' : correct ? 'border-green-400' : 'border-red-400'}
      `}>
        <img src={champion.imageUrl} alt={champion.name} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs text-gold-light font-medium text-center leading-tight">{champion.name}</span>
      {revealed && (
        <span className="text-xs text-gold/50">{champion.releaseDate.slice(0, 4)}</span>
      )}
    </div>
  );
}

export default function TimelinePage() {
  const [mode, setMode] = useState<'daily' | 'practice'>('daily');
  const { data, loading, error, reload } = usePuzzle<TimelinePuzzle>('timeline', mode);
  const { user } = useAuth();

  const [order, setOrder] = useState<TimelineChampion[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (data?.puzzle) {
      // Shuffle on load
      const shuffled = [...data.puzzle].sort(() => Math.random() - 0.5);
      setOrder(shuffled);
      setRevealed(false);
      setSubmitted(false);
    }
  }, [data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrder(items => {
        const oldIdx = items.findIndex(i => i.id === active.id);
        const newIdx = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIdx, newIdx);
      });
    }
  };

  const correctOrder = data?.puzzle ? [...data.puzzle].sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  ) : [];

  const correctCount = order.filter((c, i) => correctOrder[i]?.id === c.id).length;
  const score = Math.round((correctCount / order.length) * 1000);

  const submit = () => {
    setRevealed(true);
    setSubmitted(true);
    if (user && data) {
      results.submit({
        gameMode: 'timeline',
        puzzleId: data.puzzleId,
        isDaily: data.isDaily,
        attempts: 1,
        score,
      }).catch(() => null);
    }
  };

  const shareText = () => {
    if (!data) return '';
    const emojis = order.map((c, i) => correctOrder[i]?.id === c.id ? '🟩' : '🟥').join('');
    return `LoL Timeline ${data.isDaily ? '(Daily)' : '(Practice)'}\n${emojis}\n${correctCount}/${order.length} correct · Score: ${score}\nlolhub.gg/timeline`;
  };

  const handleModeChange = (m: 'daily' | 'practice') => {
    setMode(m);
    setRevealed(false);
    setSubmitted(false);
    reload();
  };

  if (loading) return (
    <GameLayout title="Champion Timeline" description="" mode={mode} onModeChange={handleModeChange}>
      <LoadingSpinner />
    </GameLayout>
  );

  if (error) return (
    <GameLayout title="Champion Timeline" description="" mode={mode} onModeChange={handleModeChange}>
      <p className="text-red-400 text-center py-8">{error}</p>
    </GameLayout>
  );

  return (
    <GameLayout
      title="Champion Timeline"
      description="Drag champions into order from oldest to newest release date."
      mode={mode}
      onModeChange={handleModeChange}
    >
      <div className="card">
        <div className="flex items-center justify-between mb-4 text-xs text-gold/50 uppercase tracking-wider">
          <span>← Oldest</span>
          <span>Newest →</span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order.map(c => c.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-3 flex-wrap justify-center py-2">
              {order.map((champ, i) => (
                <SortableChampion
                  key={champ.id}
                  champion={champ}
                  correct={revealed ? correctOrder[i]?.id === champ.id : null}
                  revealed={revealed}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {revealed && (
        <div className="card bg-navy-card/50">
          <p className="text-gold font-bold text-center mb-2">
            {correctCount === order.length ? '🏆 Perfect!' : `${correctCount}/${order.length} correct · Score: ${score}`}
          </p>
          <div className="text-sm text-gold/60 text-center">
            Correct order: {correctOrder.map(c => c.name).join(' → ')}
          </div>
        </div>
      )}

      {!submitted ? (
        <button className="btn-primary" onClick={submit}>Submit Order</button>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <ShareButton text={shareText()} />
          <button className="btn-secondary" onClick={() => handleModeChange(mode)}>Play Again</button>
        </div>
      )}
    </GameLayout>
  );
}
