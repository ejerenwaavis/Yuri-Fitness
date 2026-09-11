import React, { useContext } from 'react';
import { User as UserIcon, CreditCard, LogOut, Settings, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../App';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const { t, i18n } = useTranslation();

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

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('yuri_language', lng);
  };

  const isSpanish = i18n.language?.startsWith('es');

  return (
    <div className="p-6 pb-24 lg:pb-6 space-y-6">
      <div>
        <h2 className="text-3xl font-black text-textPrimary tracking-tight">{t('profile.title')}</h2>
        <p className="text-textMuted">{t('profile.subtitle')}</p>
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
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-textPrimary">{user?.name || 'User'}</h3>
            <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
              user?.role === 'admin' 
                ? 'bg-primary/20 text-primary border-primary/50' 
                : 'bg-surfaceElevated text-textMuted border-surfaceElevated'
            }`}>
              {user?.role === 'admin' ? t('profile.adminBadge') : t('profile.userBadge')}
            </span>
          </div>
          <p className="text-textMuted text-sm">{user?.email || 'user@yurifitness.com'}</p>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-lg border border-surfaceElevated border-primary/30">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="text-primary" />
          <h3 className="text-lg font-bold text-textPrimary">{t('profile.subscriptionTitle')}</h3>
        </div>
        <p className="text-textMuted text-sm mb-6">
          {t('profile.subscriptionDesc')}
        </p>
        <button 
          onClick={handleSubscribe}
          className="w-full sm:w-auto bg-primary text-black px-6 py-2 rounded-md font-bold hover:bg-primaryGlow transition-colors shadow-[0_0_15px_rgba(124,255,61,0.2)]"
        >
          {t('profile.manageSubscription')}
        </button>
      </div>

      {/* Language Selector */}
      <div className="bg-surface p-4 rounded-lg border border-surfaceElevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe size={20} className="text-primary" />
            <span className="font-medium text-textPrimary">{t('profile.language')}</span>
          </div>
          <div className="flex items-center gap-1 bg-surfaceElevated p-1 rounded-md border border-surfaceElevated">
            <button
              onClick={() => changeLanguage('es')}
              className={`px-3 py-1 text-sm font-semibold rounded transition-colors ${
                isSpanish
                  ? 'bg-primary text-black shadow-sm'
                  : 'text-textMuted hover:text-textPrimary'
              }`}
            >
              🇪🇸 Español
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-3 py-1 text-sm font-semibold rounded transition-colors ${
                !isSpanish
                  ? 'bg-primary text-black shadow-sm'
                  : 'text-textMuted hover:text-textPrimary'
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button className="w-full flex items-center gap-3 bg-surface p-4 rounded-lg border border-surfaceElevated text-textPrimary hover:bg-surfaceElevated transition-colors">
          <Settings size={20} className="text-textMuted" />
          <span className="font-medium">{t('profile.settings')}</span>
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 bg-surface p-4 rounded-lg border border-surfaceElevated text-red-500 hover:bg-surfaceElevated transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">{t('profile.logout')}</span>
        </button>
      </div>
    </div>
  );
}
