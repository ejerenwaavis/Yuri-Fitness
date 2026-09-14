import React, { useContext, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../App';
import { Lock, Mail, User, AlertCircle, Sparkles } from 'lucide-react';

export default function Auth() {
  const { login } = useContext(AuthContext);
  const { t } = useTranslation();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to authenticate with Google');
      }

      const data = await res.json();
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Something went wrong with Google authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError(t('auth.passwordLength'));
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = mode === 'signup' ? '/auth/register' : '/auth/login';
      const bodyPayload = mode === 'signup' 
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || (mode === 'signup' ? 'Registration failed' : 'Invalid email or password'));
      }

      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-surface p-8 rounded-2xl border border-surfaceElevated shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider mb-2">
            <Sparkles size={13} />
            <span>CROSS-PLATFORM FITNESS</span>
          </div>
          <h1 className="text-4xl font-black text-primary tracking-tighter">YURI</h1>
          <p className="text-xs text-textMuted">{t('auth.welcome')}</p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-surfaceElevated p-1 rounded-full border border-surfaceElevated">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
              mode === 'login'
                ? 'bg-primary text-black shadow-sm'
                : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            {t('auth.signInTab')}
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
              mode === 'signup'
                ? 'bg-primary text-black shadow-sm'
                : 'text-textMuted hover:text-textPrimary'
            }`}
          >
            {t('auth.signUpTab')}
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Authentication */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-full flex justify-center py-1 bg-surfaceElevated rounded-xl border border-surfaceElevated hover:border-primary/40 transition-colors">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Login Failed')}
              theme="filled_black"
              shape="pill"
              text={mode === 'signup' ? 'signup_with' : 'signin_with'}
              width="280"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-surfaceElevated"></div>
          <span className="flex-shrink-0 mx-3 text-textMuted text-[11px] uppercase tracking-wider">
            {t('auth.or')}
          </span>
          <div className="flex-grow border-t border-surfaceElevated"></div>
        </div>

        {/* Standard Email/Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-textMuted mb-1">{t('auth.name')}</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('auth.namePlaceholder')}
                  disabled={isLoading}
                  className="w-full bg-surfaceElevated border border-surfaceElevated rounded-xl pl-10 pr-4 py-2.5 text-sm text-textPrimary placeholder:text-textMuted/60 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-textMuted mb-1">{t('auth.email')}</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                disabled={isLoading}
                className="w-full bg-surfaceElevated border border-surfaceElevated rounded-xl pl-10 pr-4 py-2.5 text-sm text-textPrimary placeholder:text-textMuted/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-textMuted mb-1">{t('auth.password')}</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                disabled={isLoading}
                className="w-full bg-surfaceElevated border border-surfaceElevated rounded-xl pl-10 pr-4 py-2.5 text-sm text-textPrimary placeholder:text-textMuted/60 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-black/30 hover:bg-primary/15 text-primary border border-primary/50 hover:border-primary font-medium py-3 rounded-full shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 mt-2 text-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{mode === 'signup' ? t('auth.createAccount') : t('auth.login')}</span>
            )}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="text-center pt-2">
          {mode === 'login' ? (
            <p className="text-xs text-textMuted">
              {t('auth.noAccount')}{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className="text-primary font-bold hover:underline ml-1"
              >
                {t('auth.signup')}
              </button>
            </p>
          ) : (
            <p className="text-xs text-textMuted">
              {t('auth.hasAccount')}{' '}
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-primary font-bold hover:underline ml-1"
              >
                {t('auth.signin')}
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
