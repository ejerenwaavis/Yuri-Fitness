import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dumbbell,
  Target,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Flame,
  HeartPulse,
  Plus,
  X,
  Scale
} from 'lucide-react';
import { AuthContext } from '../App';
import { useUnit } from '../context/UnitContext';

interface OnboardingProps {
  onComplete?: (updatedUser: any) => void;
}

const PRESET_INJURIES = [
  { id: 'none', label: '✅ No injuries (Fully healthy)' },
  { id: 'lower_back', label: '⚡ Lower Back pain / disc' },
  { id: 'shoulders', label: '⚡ Shoulder / Rotator cuff' },
  { id: 'knees', label: '⚡ Knee discomfort / patellar' },
  { id: 'wrists', label: '⚡ Wrist pain' },
  { id: 'neck', label: '⚡ Neck tension' },
  { id: 'elbows', label: '⚡ Elbow / Tendonitis' },
  { id: 'hips', label: '⚡ Hip discomfort' }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('yuri_token');
  const { unit, setUnit } = useUnit();
  const { user } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [goal, setGoal] = useState<'hypertrophy' | 'strength' | 'fat_loss' | 'endurance'>(
    user?.profile?.goal || 'hypertrophy'
  );
  const [environment, setEnvironment] = useState<'gym' | 'home'>('gym');
  const [equipment, setEquipment] = useState<string[]>(
    user?.profile?.equipment?.length
      ? user.profile.equipment
      : ['barbell', 'dumbbell', 'cables', 'machine']
  );
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>(
    user?.profile?.level || 'intermediate'
  );
  const [daysAvailable, setDaysAvailable] = useState<number>(user?.profile?.daysAvailable || 4);
  const [sessionLength, setSessionLength] = useState<number>(user?.profile?.sessionLength || 30);
  const [age, setAge] = useState<number>(user?.profile?.age || 28);
  const [sex, setSex] = useState<'male' | 'female' | 'other'>(user?.profile?.sex || 'male');

  // Unit System & Biometrics ('kg' = Metric, 'lbs' = Imperial)
  const [unitSystem, setUnitSystem] = useState<'kg' | 'lbs'>(() => {
    return user?.profile?.weightUnit || unit || 'kg';
  });

  const initialHeightCm = user?.profile?.height || 178;
  const [heightCm, setHeightCm] = useState<number>(initialHeightCm);
  const [heightFeet, setHeightFeet] = useState<number>(() => {
    const totalInches = Math.round(initialHeightCm / 2.54);
    return Math.floor(totalInches / 12) || 5;
  });
  const [heightInches, setHeightInches] = useState<number>(() => {
    const totalInches = Math.round(initialHeightCm / 2.54);
    return (totalInches % 12) || 10;
  });

  const initialWeightKg = user?.profile?.weight || 75;
  const [displayWeight, setDisplayWeight] = useState<number>(() => {
    const isImp = (user?.profile?.weightUnit || unit) === 'lbs';
    return isImp ? Math.round(initialWeightKg * 2.20462) : initialWeightKg;
  });

  const [injuries, setInjuries] = useState<string[]>(user?.profile?.injuries || []);
  const [customInjuryInput, setCustomInjuryInput] = useState('');

  const handleUnitChange = (newUnit: 'kg' | 'lbs') => {
    if (newUnit === unitSystem) return;
    setUnitSystem(newUnit);
    setUnit(newUnit);

    if (newUnit === 'lbs') {
      // Metric -> Imperial
      const inLbs = Math.round(displayWeight * 2.20462);
      setDisplayWeight(inLbs > 0 ? inLbs : 165);

      const totalInches = Math.round(heightCm / 2.54);
      const ft = Math.floor(totalInches / 12);
      const inch = totalInches % 12;
      setHeightFeet(ft > 0 ? ft : 5);
      setHeightInches(inch >= 0 ? inch : 10);
    } else {
      // Imperial -> Metric
      const inKg = Math.round((displayWeight / 2.20462) * 2) / 2;
      setDisplayWeight(inKg > 0 ? inKg : 75);

      const totalInches = (heightFeet * 12) + heightInches;
      const inCm = Math.round(totalInches * 2.54);
      setHeightCm(inCm > 0 ? inCm : 178);
    }
  };

  const handleHeightCmChange = (val: number) => {
    setHeightCm(val);
    const totalInches = Math.round(val / 2.54);
    setHeightFeet(Math.floor(totalInches / 12) || 0);
    setHeightInches((totalInches % 12) || 0);
  };

  const handleHeightFeetChange = (ft: number) => {
    setHeightFeet(ft);
    const totalInches = (ft * 12) + heightInches;
    setHeightCm(Math.round(totalInches * 2.54));
  };

  const handleHeightInchesChange = (inch: number) => {
    setHeightInches(inch);
    const totalInches = (heightFeet * 12) + inch;
    setHeightCm(Math.round(totalInches * 2.54));
  };

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const toggleInjury = (item: string) => {
    if (item === 'none') {
      setInjuries([]);
      return;
    }
    setInjuries((prev) => {
      const filtered = prev.filter((x) => x !== 'none');
      return filtered.includes(item)
        ? filtered.filter((x) => x !== item)
        : [...filtered, item];
    });
  };

  const handleAddCustomInjury = () => {
    const trimmed = customInjuryInput.trim();
    if (!trimmed) return;
    setInjuries((prev) => {
      const filtered = prev.filter((x) => x !== 'none');
      if (filtered.some((x) => x.toLowerCase() === trimmed.toLowerCase())) return filtered;
      return [...filtered, trimmed];
    });
    setCustomInjuryInput('');
  };

  const removeCustomInjury = (item: string) => {
    setInjuries((prev) => prev.filter((x) => x !== item));
  };

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    const finalHeight = unitSystem === 'kg'
      ? (Number(heightCm) || 178)
      : Math.round(((Number(heightFeet) * 12) + Number(heightInches)) * 2.54) || 178;

    const finalWeight = unitSystem === 'kg'
      ? (Number(displayWeight) || 75)
      : Math.round((Number(displayWeight) / 2.20462) * 10) / 10 || 75;

    const profileData = {
      goal,
      level,
      daysAvailable,
      sessionLength,
      equipment: equipment.length > 0 ? equipment : ['bodyweight'],
      injuries,
      age: Number(age) || 25,
      sex,
      height: finalHeight,
      weight: finalWeight,
      weightUnit: unitSystem,
      onboardingCompleted: true
    };

    try {
      // 1. Update Profile in DB
      const resProfile = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ profile: profileData })
      });

      if (!resProfile.ok) {
        throw new Error('Failed to save profile settings');
      }

      const updatedUser = await resProfile.json();

      // Update cached user in localStorage
      const cached = localStorage.getItem('yuri_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.profile = updatedUser.profile;
        localStorage.setItem('yuri_user', JSON.stringify(parsed));
      }

      // Sync UnitContext & storage
      setUnit(unitSystem);
      localStorage.setItem('yuri_unit', unitSystem);

      // 2. Automatically generate the first custom workout session
      const resWorkout = await fetch('/api/workouts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ profile: profileData })
      });

      const newWorkout = await resWorkout.json();

      if (onComplete) {
        onComplete(updatedUser);
      }

      // Navigate to the newly generated workout runner or dashboard
      if (newWorkout?._id) {
        navigate(`/runner/${newWorkout._id}`);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('[Onboarding Finish Error]', err);
      setError(err.message || 'Something went wrong setting up your plan.');
    } finally {
      setLoading(false);
    }
  };

  const customInjuries = injuries.filter(
    (inj) => !PRESET_INJURIES.some((p) => p.id === inj) && inj !== 'none'
  );

  return (
    <div className="h-[100dvh] max-h-[100dvh] flex flex-col justify-between p-3.5 sm:p-6 max-w-lg mx-auto overflow-hidden bg-background text-textPrimary select-none">
      {/* Pinned Top Indicator */}
      <div className="shrink-0 space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-textMuted uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <span>Yuri Intake</span>
            <span className="text-surfaceElevated">•</span>
            <div className="inline-flex items-center bg-surfaceElevated rounded-md p-0.5 border border-surfaceElevated text-[9px] font-bold">
              <button
                type="button"
                onClick={() => handleUnitChange('kg')}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  unitSystem === 'kg'
                    ? 'bg-primary text-black font-black shadow-xs'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                KG
              </button>
              <button
                type="button"
                onClick={() => handleUnitChange('lbs')}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  unitSystem === 'lbs'
                    ? 'bg-primary text-black font-black shadow-xs'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                LBS
              </button>
            </div>
          </div>
          <span className="text-primary font-black">Step {step} of 4</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-surfaceElevated rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(124,255,61,0.5)]"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Middle Content Area — Sized to fit comfortably without scrolling */}
      <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto overscroll-contain py-2 pr-0.5">
        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Primary Goal */}
        {step === 1 && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-textPrimary leading-tight">
                What is your primary goal?
              </h2>
              <p className="text-textMuted text-xs mt-0.5 leading-snug">
                Yuri configures your volume, rep ranges, and fatigue curves.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'hypertrophy',
                  title: 'Build Muscle (Hypertrophy)',
                  desc: '8-12 rep range, muscle growth, moderate-heavy volume.',
                  icon: Dumbbell
                },
                {
                  id: 'strength',
                  title: 'Raw Strength',
                  desc: '3-6 rep range, heavy compound loading, longer rest periods.',
                  icon: Target
                },
                {
                  id: 'fat_loss',
                  title: 'Fat Loss & Conditioning',
                  desc: '12-15+ reps, elevated heart rate, athletic density.',
                  icon: Flame
                },
                {
                  id: 'endurance',
                  title: 'Stamina & Longevity',
                  desc: 'High endurance, mobility integration, joint-friendly work.',
                  icon: HeartPulse
                }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setGoal(item.id as any)}
                  className={`p-2.5 sm:p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                    goal === item.id
                      ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(124,255,61,0.15)]'
                      : 'bg-surface border-surfaceElevated hover:border-textMuted'
                  }`}
                >
                  <div
                    className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                      goal === item.id ? 'bg-primary text-black' : 'bg-surfaceElevated text-textMuted'
                    }`}
                  >
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-textPrimary text-xs sm:text-sm">{item.title}</h4>
                    <p className="text-[11px] text-textMuted truncate">{item.desc}</p>
                  </div>
                  {goal === item.id && <Check className="text-primary shrink-0" size={18} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Environment & Equipment */}
        {step === 2 && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-textPrimary leading-tight">
                Where do you train?
              </h2>
              <p className="text-textMuted text-xs mt-0.5 leading-snug">
                Select your environment and available gear.
              </p>
            </div>

            {/* Gym vs Home Segmented Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-surfaceElevated/60 rounded-xl border border-surfaceElevated">
              <button
                type="button"
                onClick={() => {
                  setEnvironment('gym');
                  setEquipment(['barbell', 'dumbbell', 'cables', 'machine']);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  environment === 'gym'
                    ? 'bg-primary text-black shadow-sm'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                Commercial Gym
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnvironment('home');
                  setEquipment(['dumbbell', 'bodyweight', 'resistance_bands']);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  environment === 'home'
                    ? 'bg-primary text-black shadow-sm'
                    : 'text-textMuted hover:text-textPrimary'
                }`}
              >
                Home / Limited Gear
              </button>
            </div>

            {/* Equipment multiselect */}
            <div>
              <span className="text-[10px] font-bold uppercase text-textMuted tracking-wider block mb-1.5">
                Select available equipment:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'barbell', label: 'Barbell & Plates' },
                  { id: 'dumbbell', label: 'Dumbbells' },
                  { id: 'cables', label: 'Cable Machines' },
                  { id: 'machine', label: 'Weight Machines' },
                  { id: 'resistance_bands', label: 'Resistance Bands' },
                  { id: 'bodyweight', label: 'Bodyweight Only' }
                ].map((eq) => {
                  const selected = equipment.includes(eq.id);
                  return (
                    <div
                      key={eq.id}
                      onClick={() => toggleEquipment(eq.id)}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-semibold cursor-pointer flex items-center justify-between transition-all ${
                        selected
                          ? 'bg-primary/15 border-primary text-primary'
                          : 'bg-surface border-surfaceElevated text-textMuted hover:text-textPrimary'
                      }`}
                    >
                      <span className="truncate">{eq.label}</span>
                      {selected && <Check size={14} className="shrink-0 ml-1" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Commitment & Stats */}
        {step === 3 && (
          <div className="space-y-2.5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-textPrimary leading-tight">
                Your Schedule & Level
              </h2>
              <p className="text-textMuted text-xs mt-0.5 leading-snug">
                We tailor workout frequency and session length to your life.
              </p>
            </div>

            {/* Level selection */}
            <div>
              <label className="text-[10px] font-bold uppercase text-textMuted tracking-wider block mb-1">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'beginner', label: 'Beginner', desc: '< 1 yr' },
                  { id: 'intermediate', label: 'Intermediate', desc: '1-3 yrs' },
                  { id: 'advanced', label: 'Advanced', desc: '3+ yrs' }
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLevel(l.id as any)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all ${
                      level === l.id
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-surface border-surfaceElevated text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{l.label}</div>
                    <div className="text-[9px] text-textMuted mt-0.5">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Days per week */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold uppercase text-textMuted tracking-wider">
                  Days Available / Week
                </label>
                <span className="text-xs font-black text-primary">{daysAvailable} days</span>
              </div>
              <div className="flex gap-1.5">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysAvailable(d)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      daysAvailable === d
                        ? 'bg-primary text-black border-primary shadow-sm'
                        : 'bg-surface border-surfaceElevated text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Length */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-bold uppercase text-textMuted tracking-wider">
                  Target Session Duration
                </label>
                <span className="text-xs font-black text-primary">{sessionLength} minutes</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[20, 30, 45, 60].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setSessionLength(len)}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      sessionLength === len
                        ? 'bg-primary text-black border-primary shadow-sm'
                        : 'bg-surface border-surfaceElevated text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    {len} min
                  </button>
                ))}
              </div>
            </div>

            {/* Unit Preference & Basic Stats */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase text-textMuted tracking-wider flex items-center gap-1.5">
                  <Scale size={12} className="text-primary" />
                  <span>Units & Body Stats</span>
                </label>
                {/* Metric / Imperial Segmented Pill */}
                <div className="flex items-center p-0.5 bg-surface rounded-lg border border-surfaceElevated text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => handleUnitChange('kg')}
                    className={`px-2.5 py-0.5 rounded-md transition-all ${
                      unitSystem === 'kg'
                        ? 'bg-primary text-black font-black shadow-xs'
                        : 'text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    Metric (kg / cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitChange('lbs')}
                    className={`px-2.5 py-0.5 rounded-md transition-all ${
                      unitSystem === 'lbs'
                        ? 'bg-primary text-black font-black shadow-xs'
                        : 'text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    Imperial (lbs / ft)
                  </button>
                </div>
              </div>

              {/* Input row */}
              <div className="grid grid-cols-2 gap-2">
                {unitSystem === 'kg' ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-textMuted mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={heightCm || ''}
                      onChange={(e) => handleHeightCmChange(Number(e.target.value))}
                      placeholder="178"
                      className="w-full bg-surface border border-surfaceElevated rounded-lg px-2.5 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-textMuted mb-1">
                      Height (ft & in)
                    </label>
                    <div className="flex gap-1.5">
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={heightFeet || ''}
                          onChange={(e) => handleHeightFeetChange(Number(e.target.value))}
                          placeholder="5"
                          min={3}
                          max={7}
                          className="w-full bg-surface border border-surfaceElevated rounded-lg pl-2 pr-5 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                        />
                        <span className="absolute right-1.5 top-1.5 text-[9px] font-bold text-textMuted pointer-events-none">
                          ft
                        </span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          value={heightInches != null ? heightInches : ''}
                          onChange={(e) => handleHeightInchesChange(Number(e.target.value))}
                          placeholder="10"
                          min={0}
                          max={11}
                          className="w-full bg-surface border border-surfaceElevated rounded-lg pl-2 pr-5 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                        />
                        <span className="absolute right-1.5 top-1.5 text-[9px] font-bold text-textMuted pointer-events-none">
                          in
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase text-textMuted mb-1">
                    Weight ({unitSystem === 'lbs' ? 'lbs' : 'kg'})
                  </label>
                  <input
                    type="number"
                    value={displayWeight || ''}
                    onChange={(e) => setDisplayWeight(Number(e.target.value))}
                    placeholder={unitSystem === 'lbs' ? '165' : '75'}
                    className="w-full bg-surface border border-surfaceElevated rounded-lg px-2.5 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Injuries, Limitations & Custom Additions */}
        {step === 4 && (
          <div className="space-y-2.5 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-textPrimary leading-tight">
                Injuries or Joint Limitations?
              </h2>
              <p className="text-textMuted text-xs mt-0.5 leading-snug">
                Yuri automatically excludes high-stress movements and injects safer substitutes.
              </p>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_INJURIES.map((inj, idx) => {
                const isSelected =
                  inj.id === 'none'
                    ? injuries.length === 0
                    : injuries.includes(inj.id);

                return (
                  <div
                    key={inj.id}
                    onClick={() => toggleInjury(inj.id)}
                    className={`py-1.5 px-2.5 rounded-lg border cursor-pointer font-medium text-xs flex items-center justify-between transition-all ${
                      idx === 0 ? 'col-span-2' : ''
                    } ${
                      isSelected
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-surface border-surfaceElevated text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    <span className="truncate">{inj.label}</span>
                    {isSelected && <Check size={14} className="shrink-0 ml-1" />}
                  </div>
                );
              })}
            </div>

            {/* Custom Limitation Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-bold uppercase text-textMuted tracking-wider block">
                Add other injury or limitation:
              </label>
              <div className="flex gap-1.5 items-center">
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
                  className="flex-1 bg-surface border border-surfaceElevated rounded-xl px-3 py-1.5 text-xs text-textPrimary focus:outline-none focus:border-primary placeholder:text-textMuted/50"
                />
                <button
                  type="button"
                  onClick={handleAddCustomInjury}
                  className="flex items-center gap-1 px-3 py-1.5 bg-surfaceElevated hover:bg-primary hover:text-black text-xs font-bold rounded-xl transition-colors border border-surfaceElevated shrink-0"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              {/* Custom tags list */}
              {customInjuries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {customInjuries.map((custom) => (
                    <span
                      key={custom}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30 animate-in fade-in"
                    >
                      <span>⚡ {custom}</span>
                      <button
                        type="button"
                        onClick={() => removeCustomInjury(custom)}
                        className="hover:text-red-400 focus:outline-none"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* AI Note */}
            <div className="p-2 rounded-xl bg-surfaceElevated/60 border border-surfaceElevated flex items-center gap-2 text-[11px] text-textMuted">
              <Sparkles size={16} className="text-primary shrink-0" />
              <span>
                Yuri AI dynamically configures starter routines to safeguard your joints.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Pinned Bottom Navigation Buttons */}
      <div className="shrink-0 flex items-center justify-between pt-2.5 pb-1 border-t border-surfaceElevated">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1 text-textMuted hover:text-textPrimary text-xs font-bold px-3 py-2 rounded-xl bg-surfaceElevated transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-1.5 bg-primary text-black font-black text-xs px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 transition-all ml-auto"
          >
            <span>Continue</span>
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleFinish}
            className="flex items-center gap-2 bg-primary text-black font-black text-xs px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(124,255,61,0.4)] hover:opacity-90 disabled:opacity-50 transition-all ml-auto"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                <span>Build My Workout</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
