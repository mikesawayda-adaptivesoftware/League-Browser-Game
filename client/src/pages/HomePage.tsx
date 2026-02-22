import { Link } from 'react-router-dom';

const GAMES = [
  {
    path: '/connections',
    title: 'Connections',
    description: 'Group 16 LoL items into 4 hidden categories.',
    emoji: '🔗',
    color: 'from-yellow-600/20 to-yellow-500/5',
    border: 'border-yellow-500/30',
  },
  {
    path: '/timeline',
    title: 'Champion Timeline',
    description: 'Arrange champions in order of release date.',
    emoji: '📅',
    color: 'from-blue-600/20 to-blue-500/5',
    border: 'border-blue-500/30',
  },
  {
    path: '/draft',
    title: 'Draft Puzzle',
    description: 'Counter-draft the enemy team comp.',
    emoji: '⚔️',
    color: 'from-red-600/20 to-red-500/5',
    border: 'border-red-500/30',
  },
  {
    path: '/lore',
    title: 'Lore Connections',
    description: 'Find the shortest lore path between two champions.',
    emoji: '📖',
    color: 'from-purple-600/20 to-purple-500/5',
    border: 'border-purple-500/30',
  },
  {
    path: '/ability-sound',
    title: 'Ability Sound',
    description: 'Guess the champion from an ability sound clip.',
    emoji: '🎵',
    color: 'from-green-600/20 to-green-500/5',
    border: 'border-green-500/30',
  },
  {
    path: '/patch-note',
    title: 'Patch Note',
    description: 'Identify the champion from a redacted patch note.',
    emoji: '📋',
    color: 'from-gold/20 to-gold/5',
    border: 'border-gold/30',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold text-gold tracking-wide mb-2">LoL Hub</h1>
        <p className="text-gold/60 text-lg">Daily League of Legends puzzle games</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map(g => (
          <Link
            key={g.path}
            to={g.path}
            className={`card bg-gradient-to-br ${g.color} border ${g.border} hover:brightness-110 hover:scale-[1.02] transition-all duration-150 flex flex-col gap-2`}
          >
            <div className="text-3xl">{g.emoji}</div>
            <h2 className="text-gold font-bold text-lg">{g.title}</h2>
            <p className="text-gold/60 text-sm">{g.description}</p>
            <div className="mt-auto pt-2">
              <span className="text-xs text-gold/40 uppercase tracking-widest">Play →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
