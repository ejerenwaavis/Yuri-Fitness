import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Home, Dumbbell, User, Activity, Plus, Film, Sparkles } from 'lucide-react';
import { InstallPrompt } from './components/InstallPrompt';

import Dashboard from './screens/Dashboard';
import Workouts from './screens/Workouts';
import ExerciseLibrary from './screens/ExerciseLibrary';
import Body from './screens/Body';
import Profile from './screens/Profile';
import Auth from './screens/Auth';
import Onboarding from './screens/Onboarding';
import WorkoutRunner from './screens/WorkoutRunner';
import { UnitProvider } from './context/UnitContext';

// Simple Auth Context
interface AuthContextType {
  user: any;
  login: (token: string, userData: any) => void;
  logout: () => void;
  updateUser: (userData: any) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {}
});

import { useTranslation } from 'react-i18next';

function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();

  // Active workout runner: strictly fixed full viewport, zero scroll, no install prompt collision
  if (location.pathname.startsWith('/runner')) {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-background text-textPrimary">
        {children}
      </div>
    );
  }

  // Onboarding wizard: strictly fixed full viewport, zero scroll, app-centric
  if (location.pathname === '/onboarding') {
    return (
      <div className="fixed inset-0 w-full h-[100dvh] max-h-[100dvh] overflow-hidden bg-background text-textPrimary">
        {children}
      </div>
    );
  }

  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/workouts', icon: Dumbbell, label: t('nav.workouts') },
    { to: '/exercises', icon: Film, label: t('nav.exercises') },
    { to: '/body', icon: Activity, label: t('nav.body') },
    { to: '/profile', icon: User, label: t('nav.profile') }
  ];

  return (
    <div className="flex h-screen bg-background text-textPrimary overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-surface border-r border-surfaceElevated">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tighter text-primary">YURI</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ` +
                (isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-textMuted hover:bg-surfaceElevated hover:text-textPrimary')
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <NavLink
            to="/workouts"
            className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-md shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 transition-opacity"
          >
            <Plus size={20} /> {t('nav.logWorkout')}
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto pb-28 lg:pb-0 overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <div className="max-w-5xl mx-auto w-full min-h-full">{children}</div>
        <InstallPrompt />
      </main>

      {/* Floating Pill Bottom Tab Bar for Mobile (Nike-style capsule dock) */}
      <div className="lg:hidden fixed bottom-4 inset-x-0 mx-auto max-w-sm w-[calc(100%-2rem)] z-40 pointer-events-auto">
        <nav className="bg-surface/90 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.7)] px-2.5 py-1.5 flex justify-around items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-full transition-all duration-200 ` +
                (isActive
                  ? 'text-primary font-bold drop-shadow-[0_0_8px_rgba(124,255,61,0.6)]'
                  : 'text-textMuted hover:text-textPrimary')
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} className={`transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-medium mt-0.5 tracking-tight">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for session on mount
    const storedUser = localStorage.getItem('yuri_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem('yuri_token', token);
    localStorage.setItem('yuri_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('yuri_token');
    localStorage.removeItem('yuri_user');
    setUser(null);
  };

  const updateUser = (userData: any) => {
    localStorage.setItem('yuri_user', JSON.stringify(userData));
    setUser(userData);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      <UnitProvider>
        {!user ? (
          <Auth />
        ) : (
          <BrowserRouter>
            <Layout>
              <Routes>
                {/* Onboarding Wizard route */}
                <Route
                  path="/onboarding"
                  element={<Onboarding onComplete={(updated) => updateUser(updated)} />}
                />

                {/* Active Workout Runner Route */}
                <Route path="/runner/:id" element={<WorkoutRunner />} />

                {/* Standard Tab Routes */}
                <Route
                  path="/"
                  element={
                    user.profile?.onboardingCompleted === false ? (
                      <Navigate to="/onboarding" replace />
                    ) : (
                      <Dashboard />
                    )
                  }
                />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/exercises" element={<ExerciseLibrary />} />
                <Route path="/body" element={<Body />} />
                <Route path="/profile" element={<Profile />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        )}
      </UnitProvider>
    </AuthContext.Provider>
  );
}
