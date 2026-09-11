import React, { useContext } from 'react';
import { User as UserIcon, CreditCard, LogOut, Settings } from 'lucide-react';
import { AuthContext } from '../App';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/stripe/create-checkout-session', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe (or simulated redirect)
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 pb-24 lg:pb-6 space-y-6">
      <div>
        <h2 className="text-3xl font-black text-textPrimary tracking-tight">Profile</h2>
        <p className="text-textMuted">Manage your account and settings.</p>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-surfaceElevated flex items-center gap-4">
        {user?.avatar ? (
          <img src={user.avatar} alt="Profile" className="w-16 h-16 rounded-full border border-surfaceElevated" />
        ) : (
          <div className="bg-surfaceElevated p-4 rounded-full text-primary">
            <UserIcon size={32} />
          </div>
        )}
        <div>
          <h3 className="text-xl font-bold text-textPrimary">{user?.name || 'Test User'}</h3>
          <p className="text-textMuted">{user?.email || 'test@example.com'}</p>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-surfaceElevated border-primary/30">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="text-primary" />
          <h3 className="text-lg font-bold text-textPrimary">Subscription</h3>
        </div>
        <p className="text-textMuted text-sm mb-6">
          Upgrade to Premium for full access to AI insights and unlimited workout history.
        </p>
        <button 
          onClick={handleSubscribe}
          className="w-full sm:w-auto bg-primary text-black px-6 py-2 rounded-md font-bold hover:bg-primaryGlow transition-colors shadow-[0_0_15px_rgba(124,255,61,0.2)]"
        >
          Manage Subscription
        </button>
      </div>

      <div className="space-y-2">
        <button className="w-full flex items-center gap-3 bg-surface p-4 rounded-lg border border-surfaceElevated text-textPrimary hover:bg-surfaceElevated transition-colors">
          <Settings size={20} className="text-textMuted" />
          <span className="font-medium">Settings & Preferences</span>
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 bg-surface p-4 rounded-lg border border-surfaceElevated text-red-500 hover:bg-surfaceElevated transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}
