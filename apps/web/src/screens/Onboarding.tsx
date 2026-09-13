import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dumbbell,
  Target,
  Calendar,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Flame,
  Zap,
  HeartPulse
} from 'lucide-react';

interface OnboardingProps {
  onComplete?: (updatedUser: any) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem('yuri_token');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [goal, setGoal] = useState<'hypertrophy' | 'strength' | 'fat_loss' | 'endurance'>('hypertrophy');
  const [environment, setEnvironment] = useState<'gym' | 'home'>('gym');
  const [equipment, setEquipment] = useState<string[]>(['barbell', 'dumbbell', 'cables', 'machine']);
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [daysAvailable, setDaysAvailable] = useState<number>(4);
  const [sessionLength, setSessionLength] = useState<number>(45);
  const [age, setAge] = useState<number>(28);
  const [sex, setSex] = useState<'male' | 'female' | 'other'>('male');
  const [height, setHeight] = useState<number>(178);
  const [weight, setWeight] = useState<number>(75);
  const [injuries, setInjuries] = useState<string[]>([]);

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

  const handleFinish = async () => {
    setLoading(true);
    setError(null);

    const profileData = {
      goal,
      level,
      daysAvailable,
      sessionLength,
      equipment: equipment.length > 0 ? equipment : ['bodyweight'],
      injuries,
      age: Number(age) || 25,
      sex,
      height: Number(height) || 175,
      weight: Number(weight) || 70,
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

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col justify-between p-4 sm:p-8 max-w-xl mx-auto">
      {/* Top Indicator */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between text-xs font-bold text-textMuted uppercase tracking-wider">
          <span>Yuri Intake</span>
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

      {/* Main Content Area */}
      <div className="my-auto py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Primary Goal */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-textPrimary">What is your primary goal?</h2>
              <p className="text-textMuted text-sm mt-1">Yuri configures your volume, rep ranges, and fatigue curves.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
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
                  className={`p-4 rounded-xl border flex items-start gap-4 cursor-pointer transition-all ${
                    goal === item.id
                      ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(124,255,61,0.15)]'
                      : 'bg-surface border-surfaceElevated hover:border-textMuted'
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg ${
                      goal === item.id ? 'bg-primary text-black' : 'bg-surfaceElevated text-textMuted'
                    }`}
                  >
                    <item.icon size={22} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-textPrimary text-base">{item.title}</h4>
                    <p className="text-xs text-textMuted mt-0.5">{item.desc}</p>
                  </div>
                  {goal === item.id && <Check className="text-primary mt-1" size={20} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Environment & Equipment */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-textPrimary">Where do you train?</h2>
              <p className="text-textMuted text-sm mt-1">Select your environment and available gear.</p>
            </div>

            {/* Gym vs Home toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setEnvironment('gym');
                  setEquipment(['barbell', 'dumbbell', 'cables', 'machine']);
                }}
                className={`p-4 rounded-xl border text-center font-bold transition-all ${
                  environment === 'gym'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface border-surfaceElevated text-textMuted hover:text-textPrimary'
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
                className={`p-4 rounded-xl border text-center font-bold transition-all ${
                  environment === 'home'
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-surface border-surfaceElevated text-textMuted hover:text-textPrimary'
                }`}
              >
                Home / Limited Gear
              </button>
            </div>

            {/* Equipment multiselect */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-textMuted tracking-wider">
                Select available equipment:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
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
                      className={`p-3 rounded-lg border text-xs font-semibold cursor-pointer flex items-center justify-between transition-all ${
                        selected
                          ? 'bg-primary/15 border-primary text-primary'
                          : 'bg-surface border-surfaceElevated text-textMuted hover:text-textPrimary'
                      }`}
                    >
                      <span>{eq.label}</span>
                      {selected && <Check size={16} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Commitment & Stats */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-textPrimary">Your Schedule & Level</h2>
              <p className="text-textMuted text-sm mt-1">We tailor workout frequency and session length to your life.</p>
            </div>

            {/* Level selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-textMuted tracking-wider">Experience Level</label>
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
                    className={`p-3 rounded-xl border text-center transition-all ${
                      level === l.id
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-surface border-surfaceElevated text-textMuted'
                    }`}
                  >
                    <div className="text-sm font-bold">{l.label}</div>
                    <div className="text-[10px] text-textMuted">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Days per week */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-textMuted tracking-wider">Days Available / Week</label>
                <span className="text-sm font-black text-primary">{daysAvailable} days</span>
              </div>
              <div className="flex gap-2">
                {[2, 3, 4, 5, 6].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDaysAvailable(d)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-bold transition-all ${
                      daysAvailable === d
                        ? 'bg-primary text-black border-primary'
                        : 'bg-surface border-surfaceElevated text-textMuted'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Length */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase text-textMuted tracking-wider">Target Session Duration</label>
                <span className="text-sm font-black text-primary">{sessionLength} minutes</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[20, 30, 45, 60].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setSessionLength(len)}
                    className={`py-2 rounded-lg border text-xs font-bold transition-all ${
                      sessionLength === len
                        ? 'bg-primary text-black border-primary'
                        : 'bg-surface border-surfaceElevated text-textMuted'
                    }`}
                  >
                    {len} min
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Stats Row */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-surface border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-textMuted mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-surface border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Injuries & Exclusions */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-textPrimary">Injuries or Joint Limitations?</h2>
              <p className="text-textMuted text-sm mt-1">
                Yuri automatically excludes high-stress movements for flagged joints and injects safer substitutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'none', label: '✅ No injuries (Fully healthy)' },
                { id: 'lower_back', label: '⚡ Lower Back pain / disc' },
                { id: 'shoulders', label: '⚡ Shoulder impingement / rotator cuff' },
                { id: 'knees', label: '⚡ Knee discomfort / patellar' },
                { id: 'wrists', label: '⚡ Wrist pain' },
                { id: 'neck', label: '⚡ Neck tension' }
              ].map((inj) => {
                const isSelected =
                  inj.id === 'none'
                    ? injuries.length === 0
                    : injuries.includes(inj.id);

                return (
                  <div
                    key={inj.id}
                    onClick={() => toggleInjury(inj.id)}
                    className={`p-4 rounded-xl border cursor-pointer font-medium text-sm flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-primary/15 border-primary text-primary'
                        : 'bg-surface border-surfaceElevated text-textMuted hover:text-textPrimary'
                    }`}
                  >
                    <span>{inj.label}</span>
                    {isSelected && <Check size={18} />}
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-surfaceElevated/60 border border-surfaceElevated flex items-start gap-3 text-xs text-textMuted">
              <Sparkles size={18} className="text-primary shrink-0 mt-0.5" />
              <span>
                All set! Yuri AI will immediately generate your personalized starter workout routine based on your exact equipment and injury exclusions.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-surfaceElevated">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 text-textMuted hover:text-textPrimary text-sm font-semibold px-4 py-2.5 rounded-lg bg-surfaceElevated transition-colors"
          >
            <ChevronLeft size={18} />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-2 bg-primary text-black font-bold text-sm px-6 py-2.5 rounded-lg shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 transition-all ml-auto"
          >
            <span>Continue</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleFinish}
            className="flex items-center gap-2 bg-primary text-black font-black text-sm px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(124,255,61,0.4)] hover:opacity-90 disabled:opacity-50 transition-all ml-auto"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={18} />
                <span>Build My Workout</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
