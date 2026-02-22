import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const GAMES = [
  { path: '/connections', label: 'Connections' },
  { path: '/timeline', label: 'Timeline' },
  { path: '/draft', label: 'Draft' },
  { path: '/lore', label: 'Lore' },
  { path: '/ability-sound', label: 'Ability' },
  { path: '/patch-note', label: 'Patch Note' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="border-b border-gold/20 bg-navy-card sticky top-0 z-40">
        <div className="container mx-auto px-4 max-w-4xl flex items-center justify-between h-14">
          <Link to="/" className="text-gold font-bold text-xl tracking-widest hover:brightness-125 transition">
            LoL<span className="text-gold-light">Hub</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {GAMES.map(g => (
              <NavLink
                key={g.path}
                to={g.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isActive ? 'bg-gold/20 text-gold' : 'text-gold/70 hover:text-gold hover:bg-gold/10'
                  }`
                }
              >
                {g.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <NavLink to="/leaderboard" className="text-gold/60 hover:text-gold text-sm transition hidden md:block">
              Leaderboard
            </NavLink>
            {user ? (
              <div className="flex items-center gap-2">
                <NavLink to="/profile" className="btn-secondary text-sm hidden md:block">
                  Profile
                </NavLink>
                <button onClick={logout} className="btn-secondary text-sm">
                  Sign out
                </button>
              </div>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="btn-primary text-sm">
                Sign in
              </button>
            )}
            <button
              className="md:hidden text-gold p-1"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gold/10 px-4 py-2 flex flex-col gap-1">
            {GAMES.map(g => (
              <NavLink
                key={g.path}
                to={g.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded text-sm font-medium ${isActive ? 'bg-gold/20 text-gold' : 'text-gold/70'}`
                }
              >
                {g.label}
              </NavLink>
            ))}
            <NavLink to="/leaderboard" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm text-gold/70">
              Leaderboard
            </NavLink>
          </div>
        )}
      </nav>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </>
  );
}
