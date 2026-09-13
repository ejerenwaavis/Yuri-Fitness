import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Target,
  Trophy,
  Clock,
  Play,
  CheckCircle2,
  Droplets,
  Plus,
  Minus,
  Sparkles,
  Dumbbell,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import YuriAiDrawer from '../components/YuriAiDrawer';

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('yuri_token');

  const [isAiOpen, setIsAiOpen] = useState(false);

  // Local Water Intake state (persisted daily in localStorage)
  const todayDateKey = new Date().toISOString().split('T')[0];
  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem(`yuri_water_${todayDateKey}`);
    return saved ? Number(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem(`yuri_water_${todayDateKey}`, String(waterGlasses));
  }, [waterGlasses, todayDateKey]);

  // 1. Fetch Today's Workout Session
  const { data: todayWorkout, isLoading: loadingWorkout } = useQuery<any>({
    queryKey: ['todayWorkout'],
    queryFn: async () => {
      const res = await fetch('/api/workouts/today', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to fetch today workout');
      return res.json();
    }
  });

  // 2. Fetch Weekly Stats
  const { data: statsData } = useQuery({
    queryKey: ['weeklyStats'],
    queryFn: async () => {
      const res = await fetch('/api/stats/weekly', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  // Generate fresh workout mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/workouts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to generate workout');
      return res.json();
    },
    onSuccess: (newWorkout) => {
      queryClient.setQueryData(['todayWorkout'], newWorkout);
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    }
  });

  // Water increment / decrement
  const handleAddWater = () => setWaterGlasses((prev) => Math.min(16, prev + 1));
  const handleSubWater = () => setWaterGlasses((prev) => Math.max(0, prev - 1));

  // Calculate streak from recent sessions
  const sessionCount = statsData?.sessionCount ?? 0;
  const streakDays = sessionCount > 0 ? Math.min(7, sessionCount + 1) : 1;

  const metrics = statsData?.metrics || { minutes: 45, exercises: 5, sets: 15, maxWeight: 60 };

  return (
    <div className="p-4 sm:p-6 pb-24 lg:pb-6 space-y-6 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-textPrimary tracking-tight">{t('dashboard.title')}</h2>
          <p className="text-textMuted text-sm mt-0.5">{t('dashboard.subtitle')}</p>
        </div>

        {/* Yuri AI Assistant Floating Action / Chip */}
        <button
          onClick={() => setIsAiOpen(true)}
          className="flex items-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 transition-all self-start"
        >
          <Sparkles size={16} />
          <span>Ask Yuri AI</span>
        </button>
      </div>

      {/* TODAY'S WORKOUT CARD (PRIMARY BLOCK 6 CTA) */}
      <div className="bg-surface rounded-2xl border border-surfaceElevated p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {loadingWorkout ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : todayWorkout ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {todayWorkout.completed ? 'Completed Today' : "Today's Routine"}
                </span>
                {todayWorkout.source === 'ai-edited' && (
                  <span className="text-[10px] font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                    AI Adjusted
                  </span>
                )}
              </div>
              <span className="text-xs text-textMuted flex items-center gap-1">
                <Clock size={14} /> {todayWorkout.durationMinutes || 45} min
              </span>
            </div>

            <div>
              <h3 className="text-2xl font-black text-textPrimary tracking-tight">
                {todayWorkout.exercises && todayWorkout.exercises.length > 0
                  ? todayWorkout.exercises[0].name.includes('Press')
                    ? 'Upper Body Push & Hypertrophy'
                    : todayWorkout.exercises[0].name.includes('Squat') || todayWorkout.exercises[0].name.includes('Leg')
                    ? 'Lower Body Power & Quad Strength'
                    : 'Targeted Hypertrophy Routine'
                  : 'Daily Training Session'}
              </h3>
              <p className="text-xs text-textMuted mt-1">
                {todayWorkout.exercises?.length || 0} exercises programmed • Balanced volume & progressive overload
              </p>
            </div>

            {/* Exercise preview tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {todayWorkout.exercises?.slice(0, 4).map((ex: any, idx: number) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-surfaceElevated text-textPrimary border border-surfaceElevated font-medium"
                >
                  {ex.name}
                </span>
              ))}
              {(todayWorkout.exercises?.length || 0) > 4 && (
                <span className="text-xs px-2.5 py-1 rounded-lg bg-surfaceElevated text-textMuted font-bold">
                  +{todayWorkout.exercises.length - 4} more
                </span>
              )}
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              {todayWorkout.completed ? (
                <div className="flex items-center justify-between p-3.5 bg-primary/10 border border-primary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={22} className="text-primary" />
                    <div>
                      <span className="text-sm font-black text-textPrimary">Workout Finished!</span>
                      <p className="text-xs text-textMuted">RPE logged: {todayWorkout.rpe || '💪'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Generate Another
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/runner/${todayWorkout._id || todayWorkout.id}`)}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 bg-primary text-black font-black text-base px-8 py-3.5 rounded-xl shadow-[0_0_20px_rgba(124,255,61,0.4)] hover:opacity-90 active:scale-[0.99] transition-all"
                >
                  <Play size={20} fill="currentColor" />
                  <span>Start Workout</span>
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4">
            <Dumbbell className="mx-auto text-primary opacity-60" size={40} />
            <div>
              <h3 className="text-xl font-bold text-textPrimary">Ready to build today's routine?</h3>
              <p className="text-xs text-textMuted mt-1">
                Yuri will assemble a session based on your equipment and recovery.
              </p>
            </div>
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="inline-flex items-center gap-2 bg-primary text-black font-bold px-6 py-2.5 rounded-xl shadow-md hover:opacity-90"
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Workout'}
            </button>
          </div>
        )}
      </div>

      {/* QUICK WIDGETS: STREAK COUNTER + WATER TRACKER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Streak Counter */}
        <div className="bg-surface p-5 rounded-2xl border border-surfaceElevated shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(124,255,61,0.25)]">
              <Flame size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-textPrimary tracking-tight">
                  {streakDays} Days
                </span>
                <span className="text-[10px] uppercase font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                  On Fire
                </span>
              </div>
              <p className="text-xs text-textMuted mt-0.5">Consecutive workout streak active</p>
            </div>
          </div>
        </div>

        {/* Water Intake Counter */}
        <div className="bg-surface p-5 rounded-2xl border border-surfaceElevated shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Droplets size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-textPrimary tracking-tight">
                  {waterGlasses} / 8
                </span>
                <span className="text-xs text-textMuted font-bold">Glasses</span>
              </div>
              <p className="text-xs text-textMuted mt-0.5">
                {(waterGlasses * 0.3).toFixed(1)} L of 2.5 L daily target
              </p>
            </div>
          </div>

          {/* Quick Plus / Minus */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubWater}
              disabled={waterGlasses === 0}
              className="w-9 h-9 rounded-xl bg-surfaceElevated border border-surfaceElevated text-textPrimary flex items-center justify-center hover:border-textMuted disabled:opacity-30 transition-all"
            >
              <Minus size={16} />
            </button>
            <button
              onClick={handleAddWater}
              className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-all font-bold"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* STAT SUMMARY ROW */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface p-4 rounded-xl border border-surfaceElevated shadow-md">
          <span className="text-xs text-textMuted font-medium block">Weekly Sessions</span>
          <span className="text-2xl font-black text-primary mt-1 block">
            {statsData?.sessionCount ?? 1}
          </span>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-surfaceElevated shadow-md">
          <span className="text-xs text-textMuted font-medium block">Total Volume</span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">
            {((metrics.sets || 10) * (metrics.maxWeight > 0 ? metrics.maxWeight : 50)).toLocaleString()} kg
          </span>
        </div>
        <div className="bg-surface p-4 rounded-xl border border-surfaceElevated shadow-md">
          <span className="text-xs text-textMuted font-medium block">Training Time</span>
          <span className="text-2xl font-black text-yellow-400 mt-1 block">
            {metrics.minutes || 45} m
          </span>
        </div>
      </div>

      {/* Yuri AI Side Drawer */}
      <YuriAiDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        activeWorkoutId={todayWorkout?._id || todayWorkout?.id}
        onWorkoutMutated={(mutated) => {
          queryClient.setQueryData(['todayWorkout'], mutated);
        }}
      />
    </div>
  );
}
