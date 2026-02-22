import { useState, useRef, useEffect } from 'react';
import type { Champion } from '../types';

interface Props {
  champions: Champion[];
  onSelect: (champion: Champion) => void;
  placeholder?: string;
  disabled?: boolean;
  exclude?: string[]; // champion ids to exclude
}

export default function ChampionSearch({ champions, onSelect, placeholder = 'Search champion…', disabled, exclude = [] }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length > 0
    ? champions
        .filter(c => !exclude.includes(c.id) && c.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8)
    : [];

  const handleSelect = (c: Champion) => {
    onSelect(c);
    setQuery('');
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <input
        className="input"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-30 w-full bg-navy-card border border-gold/30 rounded mt-1 shadow-xl max-h-60 overflow-y-auto">
          {filtered.map(c => (
            <li key={c.id}>
              <button
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gold/10 text-left transition-colors"
                onMouseDown={() => handleSelect(c)}
              >
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                />
                <span className="text-gold-light">{c.name}</span>
                <span className="text-gold/40 text-xs ml-auto">{c.roles.join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
