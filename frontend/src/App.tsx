import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { AskAIChatbot } from './components/common/AskAIChatbot';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { SkillsPage } from './pages/SkillsPage';
import { TestsPage } from './pages/TestsPage';
import { RadarPage } from './pages/RadarPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { api, getAuthToken, removeAuthToken } from './services/api';
import { Profile } from './types';

// Protected Route wrapper component
const ProtectedRoute: React.FC<{ userProfile: Profile | null; children: React.ReactNode }> = ({
  userProfile,
  children,
}) => {
  if (!getAuthToken()) {
    return <Navigate to="/auth?tab=login" replace />;
  }
  return children;
};

const AppContent: React.FC = () => {
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchProfile = async () => {
    if (!getAuthToken()) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    try {
      const me = await api.getMe();
      setUserProfile(me);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      removeAuthToken();
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setUserProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-indigo-400 font-semibold text-sm">
        Initializing AI Workforce Gap Radar...
      </div>
    );
  }

  // Helper to determine current page context for Ask AI
  const getCurrentPageContext = () => {
    const p = location.pathname;
    if (p === '/dashboard') return 'Dashboard';
    if (p === '/skills') return 'My Skills';
    if (p === '/tests') return 'Tests & Interview';
    if (p === '/radar') return 'Workforce Radar';
    if (p === '/roadmap') return 'Roadmap';
    return 'General';
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans">
      <div>
        <Navbar userProfile={userProfile} onLogout={handleLogout} />

        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage onAuthSuccess={fetchProfile} />} />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute userProfile={userProfile}>
                  <OnboardingPage onComplete={fetchProfile} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute userProfile={userProfile}>
                  <DashboardPage userProfile={userProfile} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/skills"
              element={
                <ProtectedRoute userProfile={userProfile}>
                  <SkillsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tests"
              element={
                <ProtectedRoute userProfile={userProfile}>
                  <TestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/radar"
              element={
                <ProtectedRoute userProfile={userProfile}>
                  <RadarPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap"
              element={
                <ProtectedRoute userProfile={userProfile}>
                  <RoadmapPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Floating Ask AI Doubt Clarity Chatbot */}
      <AskAIChatbot currentPageContext={getCurrentPageContext()} />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-12 bg-[#0a0d16]">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          AI Workforce Gap Radar &copy; 2026. Know what skills you need before the job market changes.
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
