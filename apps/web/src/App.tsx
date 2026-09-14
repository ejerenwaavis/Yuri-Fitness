import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { Home, Dumbbell, User, Activity, Plus, Film, Sparkles, BookOpen } from 'lucide-react';
import { InstallPrompt } from './components/InstallPrompt';

import Dashboard from './screens/Dashboard';
import Workouts from './screens/Workouts';
import ExerciseLibrary from './screens/ExerciseLibrary';
import Body from './screens/Body';
import Profile from './screens/Profile';
import Auth from './screens/Auth';
import Onboarding from './screens/Onboarding';
import WorkoutRunner from './screens/WorkoutRunner';
import RoutineDetail from './screens/RoutineDetail';
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
    { to: '/exercises', icon: BookOpen, label: 'Library' },
    { to: '/body', icon: Activity, label: t('nav.body') },
    { to: '/profile', icon: User, label: t('nav.profile') }
  ];

  return (
    <div className="flex h-screen bg-background text-textPrimary overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-64 flex-col justify-between bg-surface border-r border-surfaceElevated select-none">
        <div>
          <div className="p-6 pb-4">
            <h1 className="text-2xl font-black tracking-widest text-textPrimary">YURI</h1>
          </div>
          <nav className="px-3 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-3.5 px-4 py-3 rounded-2xl font-bold text-sm transition-all border ` +
                  (isActive
                    ? 'bg-[#111F12] text-[#8ce85b] border-[#8ce85b]/20 shadow-sm'
                    : 'border-transparent text-textMuted hover:bg-[#111F12]/50 hover:text-textPrimary')
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={19} className={isActive ? 'text-[#8ce85b]' : 'text-textMuted'} />
                    <span className={isActive ? 'text-[#8ce85b] font-bold' : ''}>{item.label}</span>
                    {isActive && (
                      <span className="absolute left-0 top-3 bottom-3 w-[3px] bg-[#8ce85b] rounded-r-full shadow-[0_0_8px_rgba(140,232,91,0.6)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Motivational Quote at bottom of sidebar */}
        <div className="p-6 border-t border-surfaceElevated/60 space-y-3">
          <div className="w-6 h-[2px] bg-primary/60" />
          <p className="text-xs text-textMuted font-medium leading-relaxed">
            Discipline builds the life you want.
          </p>
          <div className="pt-2">
            <span className="text-[10px] uppercase tracking-widest font-black text-textMuted/60 block">
              TRAIN / IMPROVE / BUILD
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto pb-28 lg:pb-0 overscroll-y-contain [-webkit-overflow-scrolling:touch]">
        <div className="max-w-5xl mx-auto w-full min-h-full">{children}</div>
        <InstallPrompt />
      </main>

      {/* Floating Pill Bottom Tab Bar for Mobile (Nike-style capsule dock) */}
      <div className="lg:hidden fixed bottom-4 inset-x-0 mx-auto max-w-sm w-[calc(100%-2rem)] z-40 pointer-events-auto">
        <nav className="bg-surface/90 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.7)] px-2.5 py-1.5 flex justify-around items-center relative">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 border ` +
                (isActive
                  ? 'bg-[#111F12] text-[#8ce85b] border-[#8ce85b]/20 shadow-sm'
                  : 'border-transparent text-textMuted hover:text-textPrimary')
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={20}
                    className={`transition-transform duration-200 ${
                      isActive ? 'text-[#8ce85b] scale-110' : 'text-textMuted'
                    }`}
                  />
                  <span
                    className={`text-[11px] mt-0.5 tracking-tight transition-colors ${
                      isActive ? 'text-[#8ce85b] font-bold' : 'font-medium text-textMuted'
                    }`}
                  >
                    {item.label}
                  </span>

                  {/* Green underscore indicator matching reference image */}
                  {isActive && (
                    <span className="absolute bottom-0 w-5 h-[2px] bg-[#8ce85b] rounded-full shadow-[0_0_8px_rgba(140,232,91,0.8)]" />
                  )}
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

                {/* Routine Detail Route */}
                <Route path="/routine/:id" element={<RoutineDetail />} />

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
