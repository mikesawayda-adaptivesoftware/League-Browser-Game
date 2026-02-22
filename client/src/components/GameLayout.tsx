import type { ReactNode } from 'react';

interface Props {
  title: string;
  description: string;
  mode: 'daily' | 'practice';
  onModeChange: (m: 'daily' | 'practice') => void;
  children: ReactNode;
}

export default function GameLayout({ title, description, mode, onModeChange, children }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-gold">{title}</h1>
          <div className="flex rounded overflow-hidden border border-gold/30">
            <button
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                mode === 'daily' ? 'bg-gold text-navy' : 'text-gold/60 hover:text-gold'
              }`}
              onClick={() => onModeChange('daily')}
            >
              Daily
            </button>
            <button
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                mode === 'practice' ? 'bg-gold text-navy' : 'text-gold/60 hover:text-gold'
              }`}
              onClick={() => onModeChange('practice')}
            >
              Practice
            </button>
          </div>
        </div>
        <p className="text-gold/60 text-sm mt-1">{description}</p>
      </div>
      {children}
    </div>
  );
}
