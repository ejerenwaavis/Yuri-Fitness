import React, { useState, useContext } from 'react';
import {
  User as UserIcon,
  CreditCard,
  LogOut,
  Settings,
  Globe,
  Scale,
  ShieldCheck,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Dumbbell,
  Lock,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Pencil,
  ChevronLeft,
  KeyRound,
  Sliders,
  Plus
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { useUnit } from '../context/UnitContext';
import MembershipCard from '../components/MembershipCard';
import { CINEMATIC_ASSETS } from '../utils/imagePipeline';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useContext(AuthContext);
  const { unit, setUnit } = useUnit();
  const { t, i18n } = useTranslation();
  const token = localStorage.getItem('yuri_token');

  // Modal visibility states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isFitnessOpen, setIsFitnessOpen] = useState(false);

  // Account form state
  const [name, setName] = useState(user?.name || '');
  const [nameUpdating, setNameUpdating] = useState(false);
  const [nameFeedback, setNameFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Fitness Preferences state
  const [goal, setGoal] = useState(user?.profile?.goal || 'hypertrophy');
  const [daysAvailable, setDaysAvailable] = useState<number>(user?.profile?.daysAvailable || 4);
  const [sessionLength, setSessionLength] = useState<number>(user?.profile?.sessionLength || 45);
  const [level, setLevel] = useState(user?.profile?.level || 'intermediate');
  const [equipment, setEquipment] = useState<string[]>(user?.profile?.equipment || ['barbell', 'dumbbell', 'bodyweight']);
  const [injuries, setInjuries] = useState<string[]>(user?.profile?.injuries || []);
  const [customInjuryInput, setCustomInjuryInput] = useState('');
  const [fitnessUpdating, setFitnessUpdating] = useState(false);
  const [fitnessFeedback, setFitnessFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [fitnessSaved, setFitnessSaved] = useState(false);

  const isSpanish = i18n.language?.startsWith('es');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('yuri_language', lng);
  };

  const handleSubscribe = async () => {
    try {
      const res = await fetch('/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Display Name
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setNameUpdating(true);
    setNameFeedback(null);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: name.trim() })
      });
      if (!res.ok) throw new Error('Failed to update profile name');
      const updated = await res.json();
      updateUser(updated);
      setNameFeedback({ type: 'success', msg: t('profile.profileSuccess', 'Profile updated successfully!') });
      setTimeout(() => setNameFeedback(null), 3000);
    } catch (err: any) {
      setNameFeedback({ type: 'error', msg: err.message || 'Error updating name' });
    } finally {
      setNameUpdating(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 6) {
      setPasswordFeedback({ type: 'error', msg: t('auth.passwordLength', 'Password must be at least 6 characters long.') });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', msg: t('profile.passwordMismatch', 'New passwords do not match.') });
      return;
    }

    setPasswordUpdating(true);
    try {
      const res = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setPasswordFeedback({ type: 'success', msg: t('profile.passwordSuccess', 'Password updated successfully!') });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordFeedback(null), 4000);
    } catch (err: any) {
      setPasswordFeedback({ type: 'error', msg: err.message || 'Error changing password' });
    } finally {
      setPasswordUpdating(false);
    }
  };

  // Save Fitness Profile
  const handleSaveFitness = async () => {
    setFitnessUpdating(true);
    setFitnessFeedback(null);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          profile: {
            goal,
            daysAvailable,
            sessionLength,
            level,
            equipment,
            injuries
          }
        })
      });
      if (!res.ok) throw new Error('Failed to update fitness profile');
      const updated = await res.json();
      updateUser(updated);

      // Auto-regenerate active routine for the newly selected goal and equipment
      try {
        await fetch('/api/workouts/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ profile: updated.profile })
        });
      } catch (genErr) {
        console.warn('Routine auto-sync notice:', genErr);
      }

      setFitnessFeedback({ type: 'success', msg: 'Training profile and active routine synced!' });
      setFitnessSaved(true);
    } catch (err: any) {
      setFitnessFeedback({ type: 'error', msg: err.message || 'Failed to save profile' });
    } finally {
      setFitnessUpdating(false);
    }
  };

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const toggleInjury = (inj: string) => {
    setInjuries((prev) =>
      prev.includes(inj) ? prev.filter((i) => i !== inj) : [...prev, inj]
    );
  };

  const handleAddCustomInjury = () => {
    const trimmed = customInjuryInput.trim();
    if (!trimmed) return;
    setInjuries((prev) => {
      if (prev.some((x) => x.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, trimmed];
    });
    setCustomInjuryInput('');
  };

  const removeCustomInjury = (item: string) => {
    setInjuries((prev) => prev.filter((x) => x !== item));
  };

  const isPro = user?.subscriptionStatus === 'pro';

  return (
    <div className="p-4 sm:p-6 pb-28 lg:pb-8 space-y-4 animate-in fade-in duration-300">
      {/* Top Header Bar: Back to Home + Settings Gear */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1.5 rounded-full text-textMuted hover:text-textPrimary transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <h2 className="text-xl sm:text-2xl font-black text-textPrimary tracking-tight">
            Profile
          </h2>
        </div>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 rounded-xl bg-surfaceElevated border border-surfaceElevated hover:border-primary/40 text-textMuted hover:text-textPrimary transition-all shadow-sm"
          title="Settings & Preferences"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* 1. User Summary Card (Green rim-lit avatar, admin/pro badge, edit button) */}
      <div className="bg-surface p-5 rounded-2xl border border-surfaceElevated flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3.5 sm:gap-4">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="w-14 h-14 rounded-2xl border-2 border-primary/50 object-cover shadow-[0_0_12px_rgba(124,255,61,0.2)]"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-surfaceElevated border-2 border-primary/40 flex items-center justify-center text-primary shadow-[0_0_12px_rgba(124,255,61,0.2)]">
              <UserIcon size={26} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-textPrimary">{user?.name || 'Avis Ejerenwa'}</h3>
              <span className="text-[10px] sm:text-xs uppercase font-black px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40">
                {user?.role === 'admin' ? 'ADMIN' : isPro ? 'PRO' : 'MEMBER'}
              </span>
            </div>
            <p className="text-textMuted text-xs sm:text-sm mt-0.5">{user?.email || 'ejerenwaavis@gmail.com'}</p>
          </div>
        </div>

        <button
          onClick={() => setIsAccountOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-textPrimary bg-surfaceElevated hover:bg-primary/20 border border-surfaceElevated hover:border-primary/40 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
        >
          <Pencil size={13} className="text-primary" />
          <span>Edit</span>
        </button>
      </div>

      {/* 2. Membership & Subscription Card */}
      <MembershipCard
        subscriptionStatus={user?.subscriptionStatus || 'free'}
        onUpgrade={handleSubscribe}
      />

      {/* 3. Structured Categories Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase text-textMuted tracking-wider px-1">
          Account & App Management
        </h4>

        {/* Category Row 1: Account & Security */}
        <div
          onClick={() => setIsAccountOpen(true)}
          role="button"
          tabIndex={0}
          className="w-full bg-surface p-4 rounded-2xl border border-surfaceElevated hover:border-textMuted/40 flex items-center justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-surfaceElevated flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="font-bold text-textPrimary text-sm block">
                {t('profile.accountSecurity', 'Account & Security')}
              </span>
              <span className="text-xs text-textMuted">
                {t('profile.accountSecurityDesc', 'Edit display name, email & change password')}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-textMuted group-hover:text-textPrimary transition-colors" />
        </div>

        {/* Category Row 2: Settings & Preferences (WORKING SETTINGS BUTTON!) */}
        <div
          onClick={() => setIsSettingsOpen(true)}
          role="button"
          tabIndex={0}
          className="w-full bg-surface p-4 rounded-2xl border border-surfaceElevated hover:border-textMuted/40 flex items-center justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-surfaceElevated flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <Settings size={20} />
            </div>
            <div>
              <span className="font-bold text-textPrimary text-sm block">
                {t('profile.settings', 'Settings & Preferences')}
              </span>
              <span className="text-xs text-textMuted">
                {unit === 'kg' ? 'Metric (kg)' : 'Imperial (lbs)'} • {isSpanish ? 'Español' : 'English'}
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-textMuted group-hover:text-textPrimary transition-colors" />
        </div>

        {/* Category Row 3: Fitness & Training Profile */}
        <div
          onClick={() => {
            setFitnessSaved(false);
            setFitnessFeedback(null);
            setIsFitnessOpen(true);
          }}
          role="button"
          tabIndex={0}
          className="w-full bg-surface p-4 rounded-2xl border border-surfaceElevated hover:border-textMuted/40 flex items-center justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-surfaceElevated flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
              <Dumbbell size={20} />
            </div>
            <div>
              <span className="font-bold text-textPrimary text-sm block">
                {t('profile.fitnessProfile', 'Fitness & Equipment')}
              </span>
              <span className="text-xs text-textMuted">
                {daysAvailable} days/wk • {sessionLength} min • {equipment.length} items
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-textMuted group-hover:text-textPrimary transition-colors" />
        </div>

        {/* Category Row 4: App Info & Version */}
        <div className="w-full bg-surface/50 p-4 rounded-2xl border border-surfaceElevated/50 flex items-center justify-between text-xs text-textMuted">
          <div className="flex items-center gap-3">
            <HelpCircle size={18} className="text-textMuted" />
            <span>Yuri Fitness PWA</span>
          </div>
          <span className="font-bold text-textMuted">v1.2.0 • Online</span>
        </div>

        {/* Category Row 5: Log Out */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 bg-surface p-4 rounded-2xl border border-surfaceElevated text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          <span>{t('profile.logout')}</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: SETTINGS & PREFERENCES (LANGUAGE + UNITS + DEFAULTS) */}
      {/* ========================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-surfaceElevated rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-surfaceElevated pb-3">
              <div className="flex items-center gap-2.5">
                <Settings className="text-primary" size={22} />
                <h3 className="text-lg font-black text-textPrimary">
                  {t('profile.settings', 'Settings & Preferences')}
                </h3>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-full text-textMuted hover:text-textPrimary bg-surfaceElevated"
              >
                <X size={18} />
              </button>
            </div>

            {/* Language Setting */}
            <div className="bg-surfaceElevated/60 p-4 rounded-2xl border border-surfaceElevated flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-primary" />
                <div>
                  <span className="font-bold text-textPrimary text-sm block">
                    {t('profile.language', 'Language')}
                  </span>
                  <span className="text-[11px] text-textMuted">UI localization</span>
                </div>
              </div>
              <div className="flex items-center p-1 bg-surface rounded-full border border-surfaceElevated">
                <button
                  type="button"
                  onClick={() => changeLanguage('es')}
                  className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                    isSpanish
                      ? 'bg-primary text-black shadow-sm'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  🇪🇸 Español
                </button>
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                    !isSpanish
                      ? 'bg-primary text-black shadow-sm'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Unit of Measurement Setting */}
            <div className="bg-surfaceElevated/60 p-4 rounded-2xl border border-surfaceElevated flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scale size={20} className="text-primary" />
                <div>
                  <span className="font-bold text-textPrimary text-sm block">
                    {t('profile.unitOfMeasurement', 'Unit of Measurement')}
                  </span>
                  <span className="text-[11px] text-textMuted">
                    {t('profile.unitDesc', 'Site-wide weight display preference')}
                  </span>
                </div>
              </div>
              <div className="flex items-center p-1 bg-surface rounded-full border border-surfaceElevated">
                <button
                  type="button"
                  onClick={() => setUnit('kg')}
                  className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                    unit === 'kg'
                      ? 'bg-primary text-black shadow-sm'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  Metric (kg)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('lbs')}
                  className={`px-3.5 py-1 text-xs font-bold rounded-full transition-all ${
                    unit === 'lbs'
                      ? 'bg-primary text-black shadow-sm'
                      : 'text-textMuted hover:text-textPrimary'
                  }`}
                >
                  Imperial (lbs)
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="bg-primary text-black font-black px-6 py-2.5 rounded-xl text-xs hover:opacity-90 transition-all shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ACCOUNT & SECURITY (NAME + PASSWORD RESET) */}
      {/* ========================================================= */}
      {isAccountOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-surfaceElevated rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surfaceElevated pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="text-primary" size={22} />
                <h3 className="text-lg font-black text-textPrimary">
                  {t('profile.accountSecurity', 'Account & Security')}
                </h3>
              </div>
              <button
                onClick={() => setIsAccountOpen(false)}
                className="p-1.5 rounded-full text-textMuted hover:text-textPrimary bg-surfaceElevated"
              >
                <X size={18} />
              </button>
            </div>

            {/* SECTION 1: Display Name */}
            <form onSubmit={handleSaveName} className="space-y-3">
              <h4 className="text-xs font-black uppercase text-primary tracking-wider">
                Profile Information
              </h4>
              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">
                  {t('profile.displayName', 'Display Name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surfaceElevated border border-surfaceElevated rounded-xl px-3.5 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-primary"
                  placeholder="Your Full Name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">
                  {t('profile.email', 'Email Address')}
                </label>
                <div className="flex items-center gap-2 bg-surfaceElevated/50 border border-surfaceElevated rounded-xl px-3.5 py-2.5 text-sm text-textMuted">
                  <Lock size={14} />
                  <span>{user?.email || 'user@yurifitness.com'}</span>
                </div>
              </div>

              {nameFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    nameFeedback.type === 'success'
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                >
                  {nameFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{nameFeedback.msg}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={nameUpdating}
                  className="bg-primary text-black font-black px-5 py-2 rounded-xl text-xs hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                >
                  {nameUpdating ? 'Saving...' : t('profile.saveChanges', 'Save Changes')}
                </button>
              </div>
            </form>

            <div className="border-t border-surfaceElevated pt-4" />

            {/* SECTION 2: Change Password */}
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound size={16} className="text-primary" />
                <h4 className="text-xs font-black uppercase text-primary tracking-wider">
                  {t('profile.changePassword', 'Change Password')}
                </h4>
              </div>

              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">
                  {t('profile.currentPassword', 'Current Password')}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-xl px-3.5 py-2.5 pr-10 text-sm text-textPrimary focus:outline-none focus:border-primary"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
                  >
                    {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">
                  {t('profile.newPassword', 'New Password')}
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-xl px-3.5 py-2.5 pr-10 text-sm text-textPrimary focus:outline-none focus:border-primary"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
                  >
                    {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">
                  {t('profile.confirmPassword', 'Confirm New Password')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surfaceElevated border border-surfaceElevated rounded-xl px-3.5 py-2.5 text-sm text-textPrimary focus:outline-none focus:border-primary"
                  placeholder="Repeat new password"
                />
              </div>

              {passwordFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordFeedback.type === 'success'
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                >
                  {passwordFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{passwordFeedback.msg}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordUpdating}
                  className="bg-primary text-black font-black px-5 py-2 rounded-xl text-xs hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                >
                  {passwordUpdating ? 'Updating...' : t('profile.changePassword', 'Update Password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: FITNESS & EQUIPMENT PROFILE */}
      {/* ========================================================= */}
      {isFitnessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-surfaceElevated rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surfaceElevated pb-3">
              <div className="flex items-center gap-2.5">
                <Dumbbell className="text-primary" size={22} />
                <h3 className="text-lg font-black text-textPrimary">
                  {t('profile.fitnessProfile', 'Fitness & Equipment Profile')}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsFitnessOpen(false);
                  setFitnessSaved(false);
                }}
                className="p-1.5 rounded-full text-textMuted hover:text-textPrimary bg-surfaceElevated"
              >
                <X size={18} />
              </button>
            </div>

            {fitnessSaved ? (
              <div className="py-4 space-y-6 animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_20px_rgba(124,255,61,0.3)]">
                    <CheckCircle2 size={36} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-textPrimary tracking-tight">
                      Profile & Routine Saved!
                    </h4>
                    <p className="text-xs text-textMuted mt-1 max-w-sm">
                      Your training target, equipment availability, and limitations have been saved. Your active workout routine has been updated.
                    </p>
                  </div>
                </div>

                {/* Prompt Card */}
                <div className="bg-surfaceElevated/70 border border-surfaceElevated rounded-2xl p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Sparkles size={15} />
                    <span>Intake Flow Option</span>
                  </div>
                  <p className="text-sm text-textSecondary leading-relaxed">
                    Would you also like to step through the guided 4-step intake questionnaire to fine-tune your personalized Yuri experience?
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFitnessOpen(false);
                      setFitnessSaved(false);
                      navigate('/onboarding');
                    }}
                    className="w-full py-3.5 px-4 rounded-xl bg-primary text-black font-black text-sm hover:opacity-95 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(124,255,61,0.25)]"
                  >
                    <Sliders size={18} />
                    <span>Redo Guided Intake Flow</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFitnessOpen(false);
                      setFitnessSaved(false);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-surfaceElevated hover:bg-surfaceElevated/80 text-textMuted hover:text-textPrimary text-sm font-bold transition-all border border-surfaceElevated"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Target Goal */}
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-2 uppercase tracking-wider">
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'hypertrophy', label: 'Hypertrophy / Muscle' },
                      { id: 'strength', label: 'Raw Strength' },
                      { id: 'fat_loss', label: 'Fat Loss & Tone' },
                      { id: 'endurance', label: 'Endurance' }
                    ].map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setGoal(g.id)}
                        className={`p-3 rounded-xl text-sm font-bold border transition-all ${
                          goal === g.id
                            ? 'bg-primary/20 text-primary border-primary shadow-sm'
                            : 'bg-surfaceElevated border-surfaceElevated text-textMuted hover:text-textPrimary'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Days / Week */}
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-2 uppercase tracking-wider">
                    Days / Week
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[2, 3, 4, 5, 6].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDaysAvailable(d)}
                        className={`h-11 rounded-xl text-sm font-black border transition-all flex items-center justify-center ${
                          daysAvailable === d
                            ? 'bg-primary text-black border-primary shadow-[0_0_12px_rgba(124,255,61,0.3)]'
                            : 'bg-surfaceElevated text-textMuted border-surfaceElevated hover:text-textPrimary'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-2 uppercase tracking-wider">
                    Duration (min)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[20, 30, 45, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setSessionLength(m)}
                        className={`h-11 rounded-xl text-sm font-black border transition-all flex items-center justify-center ${
                          sessionLength === m
                            ? 'bg-primary text-black border-primary shadow-[0_0_12px_rgba(124,255,61,0.3)]'
                            : 'bg-surfaceElevated text-textMuted border-surfaceElevated hover:text-textPrimary'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equipment Inventory */}
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-2 uppercase tracking-wider">
                    Available Equipment
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'barbell', label: 'Barbell' },
                      { id: 'dumbbell', label: 'Dumbbells' },
                      { id: 'cables', label: 'Cable Machine' },
                      { id: 'machines', label: 'Gym Machines' },
                      { id: 'bodyweight', label: 'Bodyweight Only' },
                      { id: 'bands', label: 'Resistance Bands' },
                      { id: 'bench', label: 'Adjustable Bench' }
                    ].map((item) => {
                      const isSelected = equipment.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleEquipment(item.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                            isSelected
                              ? 'bg-primary/20 text-primary border-primary shadow-sm'
                              : 'bg-surfaceElevated border-surfaceElevated text-textMuted hover:text-textPrimary'
                          }`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Joint Exclusions */}
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-2 uppercase tracking-wider">
                    Joint Exclusions & Limitations
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      { id: 'lower_back', label: 'Lower Back' },
                      { id: 'shoulders', label: 'Shoulders' },
                      { id: 'knees', label: 'Knees' },
                      { id: 'wrists', label: 'Wrists' },
                      { id: 'neck', label: 'Neck' },
                      { id: 'elbows', label: 'Elbows' },
                      { id: 'hips', label: 'Hips' }
                    ].map((inj) => {
                      const isSelected = injuries.includes(inj.id);
                      return (
                        <button
                          key={inj.id}
                          type="button"
                          onClick={() => toggleInjury(inj.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                            isSelected
                              ? 'bg-red-500/20 text-red-400 border-red-500 shadow-sm'
                              : 'bg-surfaceElevated border-surfaceElevated text-textMuted hover:text-textPrimary'
                          }`}
                        >
                          {inj.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Limitation Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase text-textMuted tracking-wider">
                      Add Custom Injury / Limitation
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customInjuryInput}
                        onChange={(e) => setCustomInjuryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomInjury();
                          }
                        }}
                        placeholder="e.g. Achilles tendonitis, Hernia, Tennis elbow..."
                        className="flex-1 bg-surfaceElevated border border-surfaceElevated rounded-xl px-3.5 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary placeholder:text-textMuted/50"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomInjury}
                        className="flex items-center gap-1 px-4 py-2 bg-surfaceElevated hover:bg-primary hover:text-black text-sm font-bold rounded-xl transition-colors border border-surfaceElevated shrink-0"
                      >
                        <Plus size={16} />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Custom Tags */}
                    {injuries.filter((inj) => !['lower_back', 'shoulders', 'knees', 'wrists', 'neck', 'elbows', 'hips'].includes(inj)).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {injuries
                          .filter((inj) => !['lower_back', 'shoulders', 'knees', 'wrists', 'neck', 'elbows', 'hips'].includes(inj))
                          .map((custom) => (
                            <span
                              key={custom}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30"
                            >
                              <span>⚡ {custom}</span>
                              <button
                                type="button"
                                onClick={() => removeCustomInjury(custom)}
                                className="hover:text-red-400 focus:outline-none"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {fitnessFeedback && (
                  <div
                    className={`p-3 rounded-xl text-sm flex items-center gap-2.5 ${
                      fitnessFeedback.type === 'success'
                        ? 'bg-primary/15 text-primary border border-primary/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {fitnessFeedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{fitnessFeedback.msg}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-surfaceElevated flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFitnessOpen(false);
                      setFitnessSaved(false);
                    }}
                    className="px-4 py-2.5 text-sm font-bold text-textMuted hover:text-textPrimary bg-surfaceElevated rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={fitnessUpdating}
                    onClick={handleSaveFitness}
                    className="bg-primary text-black font-black px-6 py-2.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
                  >
                    {fitnessUpdating ? 'Syncing...' : 'Save Profile & Update Routine'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

