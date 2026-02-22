import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ConnectionsPage from './games/connections/ConnectionsPage';
import TimelinePage from './games/timeline/TimelinePage';
import DraftPage from './games/draft/DraftPage';
import LorePage from './games/lore/LorePage';
import AbilitySoundPage from './games/ability-sound/AbilitySoundPage';
import PatchNotePage from './games/patch-note/PatchNotePage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="connections" element={<ConnectionsPage />} />
            <Route path="timeline" element={<TimelinePage />} />
            <Route path="draft" element={<DraftPage />} />
            <Route path="lore" element={<LorePage />} />
            <Route path="ability-sound" element={<AbilitySoundPage />} />
            <Route path="patch-note" element={<PatchNotePage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
