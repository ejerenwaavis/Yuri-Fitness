import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Dumbbell, User, Activity, Plus, Film } from 'lucide-react';
import { InstallPrompt } from './components/InstallPrompt';

import Dashboard from './screens/Dashboard';
import Workouts from './screens/Workouts';
import ExerciseLibrary from './screens/ExerciseLibrary';
import Body from './screens/Body';
import Profile from './screens/Profile';
import Auth from './screens/Auth';

// Simple Auth Context
interface AuthContextType {
  user: any;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

import { useTranslation } from 'react-i18next';

function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();

  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/workouts', icon: Dumbbell, label: t('nav.workouts') },
    { to: '/exercises', icon: Film, label: t('nav.exercises') },
    { to: '/body', icon: Activity, label: t('nav.body') },
    { to: '/profile', icon: User, label: t('nav.profile') },
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
                (isActive ? 'bg-primary/10 text-primary' : 'text-textMuted hover:bg-surfaceElevated hover:text-textPrimary')
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4">
          <button className="w-full flex items-center justify-center gap-2 bg-primary text-black font-bold py-3 rounded-md shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90">
            <Plus size={20} /> {t('nav.logWorkout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto w-full h-full">
          {children}
        </div>
        <InstallPrompt />
      </main>

      {/* Bottom Tab Bar for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surfaceElevated px-2 py-2 pb-safe flex justify-around items-center z-40">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex flex-col items-center p-1.5 transition-colors ` +
              (isActive ? 'text-primary' : 'text-textMuted hover:text-textPrimary')
            }
          >
            <item.icon size={22} />
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>
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
      setUser(JSON.parse(storedUser));
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

  if (loading) return null; // Or a spinner

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!user ? (
        <Auth />
      ) : (
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/workouts" element={<Workouts />} />
              <Route path="/exercises" element={<ExerciseLibrary />} />
              <Route path="/body" element={<Body />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      )}
    </AuthContext.Provider>
  );
}
