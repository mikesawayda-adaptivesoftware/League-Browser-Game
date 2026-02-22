import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Outlet />
      </main>
      <footer className="text-center py-4 text-gold/40 text-sm border-t border-gold/10">
        Not affiliated with Riot Games · Fan Project
      </footer>
    </div>
  );
}
