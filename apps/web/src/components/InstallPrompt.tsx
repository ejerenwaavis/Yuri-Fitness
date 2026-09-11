import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function InstallPrompt() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-[80px] lg:bottom-4 left-4 right-4 lg:left-72 lg:right-4 bg-surfaceElevated p-4 rounded-md border border-primary/20 shadow-lg flex items-center justify-between z-50">
      <div>
        <h4 className="text-textPrimary font-bold">{t('install.title')}</h4>
        <p className="text-sm text-textMuted">{t('install.desc')}</p>
      </div>
      <button 
        onClick={handleInstallClick}
        className="bg-primary text-black px-4 py-2 rounded-sm font-semibold hover:bg-primaryGlow transition-colors"
      >
        {t('install.button')}
      </button>
    </div>
  );
}
