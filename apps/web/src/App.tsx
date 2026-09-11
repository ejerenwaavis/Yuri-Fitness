import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Dumbbell, User, Activity, Plus } from 'lucide-react';
import { InstallPrompt } from './components/InstallPrompt';

import Dashboard from './screens/Dashboard';
import Workouts from './screens/Workouts';
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-surfaceElevated px-6 py-2 pb-safe flex justify-between items-center z-40">
        {navItems.slice(0, 2).map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center p-2 ` + (isActive ? 'text-primary' : 'text-textMuted')}>
            <item.icon size={24} />
          </NavLink>
        ))}
        
        {/* Center FAB */}
        <div className="relative -top-5">
          <button className="bg-primary text-black p-4 rounded-full shadow-[0_0_20px_rgba(124,255,61,0.4)] flex items-center justify-center hover:scale-105 transition-transform">
            <Plus size={28} />
          </button>
        </div>

        {navItems.slice(2, 4).map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex flex-col items-center p-2 ` + (isActive ? 'text-primary' : 'text-textMuted')}>
            <item.icon size={24} />
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
              <Route path="/body" element={<Body />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      )}
    </AuthContext.Provider>
  );
}
