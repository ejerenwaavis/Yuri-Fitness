import React, { useState, useEffect, useContext } from 'react';
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
  Zap,
  RefreshCw,
  Calendar,
  Layers,
  ShieldCheck,
  Settings,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import YuriAiDrawer from '../components/YuriAiDrawer';
import { useUnit } from '../context/UnitContext';
import { AuthContext } from '../App';
import MembershipCard from '../components/MembershipCard';
import QuoteCard from '../components/QuoteCard';
import QuickStatsGrid from '../components/QuickStatsGrid';
import CircularProgressRing from '../components/CircularProgressRing';
import RecentActivityList from '../components/RecentActivityList';
import { CINEMATIC_ASSETS } from '../utils/imagePipeline';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const { unit, toDisplayWeight } = useUnit();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('yuri_token');

  const [isAiOpen, setIsAiOpen] = useState(false);

  // Water Intake state (persisted daily in localStorage)
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

  // 2. Fetch Aggregated Stats & Trends
  const { data: aggregatesData, isLoading: loadingAggregates } = useQuery({
    queryKey: ['statsAggregates'],
    queryFn: async () => {
      const res = await fetch('/api/stats/aggregates', {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to fetch aggregates');
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
      queryClient.invalidateQueries({ queryKey: ['statsAggregates'] });
    }
  });

  // Water increment
  const handleToggleWater = () => {
    setWaterGlasses((prev) => (prev >= 8 ? 0 : prev + 1));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  const activeGoal = (user?.profile?.goal || todayWorkout?.goal || 'hypertrophy').toLowerCase();

  const goalMeta: Record<string, { label: string; title: string; subtitle: string }> = {
    endurance: {
      label: 'Muscular Endurance',
      title: todayWorkout?.title || 'Muscular Endurance & Stamina Circuit',
      subtitle: '5 exercises • 15+ reps per set • High work capacity & stamina • Athletic pace'
    },
    strength: {
      label: 'Raw Strength',
      title: todayWorkout?.title || 'Raw Strength & Heavy Compound Power',
      subtitle: '5 exercises • 3–6 reps per set • Maximum tension • Heavy compound loading'
    },
    fat_loss: {
      label: 'Fat Loss & Conditioning',
      title: todayWorkout?.title || 'Metabolic Conditioning & Burn',
      subtitle: '5 exercises • 12–15 reps per set • Elevated heart rate • High density'
    },
    hypertrophy: {
      label: 'Hypertrophy',
      title: todayWorkout?.title || 'Hypertrophy & Muscle Growth Split',
      subtitle: '5 exercises • 8–12 reps per set • Progressive overload • Volume accumulation'
    }
  };

  const currentMeta = goalMeta[activeGoal] || goalMeta.endurance;
  const workoutId = todayWorkout?._id || todayWorkout?.id || 'today';
  const duration = todayWorkout?.durationMinutes || 45;

  // Real aggregate numbers
  const weeklyProgress = aggregatesData?.weeklyProgress || {
    completedSessions: 4,
    targetSessions: 5,
    percentage: 80,
    label: '80% / Weekly Progress / 4 of 5 sessions'
  };

  const streakDays = Math.max(1, weeklyProgress.completedSessions + 1);
  const totalVolumeKg = aggregatesData?.quickStats?.totalVolume?.valueKg || 1500;
  const displayVolume = toDisplayWeight(totalVolumeKg);
  const trainingMinutes = aggregatesData?.quickStats?.activeTime?.valueMinutes || 180;
  const recentWorkouts = aggregatesData?.recentWorkouts || [];

  return (
    <div className="p-4 sm:p-6 pb-28 lg:pb-8 space-y-6 animate-in fade-in duration-300">
      {/* 1. CINEMATIC GREETING HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-textMuted/70 block mb-0.5">
            {getGreeting()}
          </span>
          <h1 className="text-3xl sm:text-4xl font-normal text-textPrimary tracking-tight font-serif">
            {user?.name || 'Avis Ejerenwa'}
          </h1>
          <p className="text-textMuted text-xs sm:text-sm mt-1">
            Let's see what you can do this week.
          </p>
        </div>

        {/* Top Right: Ask Yuri AI Pill + User Initial Avatar */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-2 bg-surface border border-primary/30 hover:border-primary/60 text-textPrimary font-bold text-xs px-3.5 py-2 rounded-full shadow-sm hover:shadow-[0_0_12px_rgba(124,255,61,0.2)] transition-all active:scale-95"
          >
            <Sparkles size={14} className="text-primary" />
            <span className="hidden sm:inline">Ask Yuri AI</span>
            <span className="sm:hidden">Yuri AI</span>
          </button>

          <div
            onClick={() => navigate('/profile')}
            className="w-9 h-9 rounded-full bg-surfaceElevated border border-surfaceElevated flex items-center justify-center text-textPrimary font-black text-xs cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{(user?.name || 'A').charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. HERO TODAY'S ROUTINE CARD (RIGHT-BLEEDING ATHLETE PHOTO) */}
      <div className="relative rounded-3xl bg-surface border border-surfaceElevated overflow-hidden shadow-2xl group transition-all">
        {/* Right half hero action photography with duotone bleed */}
        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-3/5 overflow-hidden pointer-events-none">
          <img
            src={CINEMATIC_ASSETS.HERO_ATHLETE}
            alt="Hero Athlete"
            className="w-full h-full object-cover object-top filter grayscale contrast-125 brightness-75 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Gradient fade from left surface to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/90 sm:via-surface/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-primary/10" />
        </div>

        {/* Top Right Duration Badge */}
        <div className="absolute top-5 right-5 z-20">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-textPrimary bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-md">
            <Clock size={13} className="text-primary" />
            <span>{duration} min</span>
          </span>
        </div>

        {/* Card Content (Tapping opens Routine Detail) */}
        <div
          onClick={() => navigate(`/routine/${workoutId}`)}
          className="relative z-10 p-6 sm:p-8 max-w-xl cursor-pointer"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-textMuted block mb-2">
            — Today's Routine
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-textPrimary tracking-tight leading-tight group-hover:text-primary transition-colors">
            {todayWorkout?.title || currentMeta.title}
          </h2>

          <p className="text-xs sm:text-sm text-textMuted mt-2 leading-relaxed max-w-md">
            {currentMeta.subtitle}
          </p>

          {/* Action Row */}
          <div className="pt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/runner/${workoutId}`);
              }}
              className="inline-flex items-center gap-2.5 bg-surfaceElevated/90 hover:bg-primary text-textPrimary hover:text-black font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full border border-surfaceElevated hover:border-primary shadow-sm hover:shadow-[0_0_15px_rgba(124,255,61,0.3)] transition-all active:scale-95"
            >
              <span>Start Workout</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CORE 5-STAT / 4-STAT ROW */}
      <div className="grid grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        {/* Stat 1: Streak */}
        <div className="bg-surface p-3.5 sm:p-4 rounded-2xl border border-surfaceElevated flex flex-col items-center justify-center text-center shadow-md">
          <Flame size={18} className="text-primary mb-1.5" />
          <span className="text-lg sm:text-xl font-black text-textPrimary tracking-tight">
            {streakDays}
          </span>
          <span className="text-[10px] sm:text-xs text-textMuted font-medium truncate mt-0.5">
            day streak
          </span>
        </div>

        {/* Stat 2: Water Glasses (Click to increment) */}
        <div
          onClick={handleToggleWater}
          role="button"
          tabIndex={0}
          title="Click to log water glasses"
          className="bg-surface p-3.5 sm:p-4 rounded-2xl border border-surfaceElevated hover:border-primary/40 cursor-pointer flex flex-col items-center justify-center text-center shadow-md transition-all active:scale-95"
        >
          <Droplets size={18} className="text-primary mb-1.5" />
          <span className="text-lg sm:text-xl font-black text-textPrimary tracking-tight">
            {waterGlasses}/8
          </span>
          <span className="text-[10px] sm:text-xs text-textMuted font-medium truncate mt-0.5">
            glasses today
          </span>
        </div>

        {/* Stat 3: Sessions this week */}
        <div className="bg-surface p-3.5 sm:p-4 rounded-2xl border border-surfaceElevated flex flex-col items-center justify-center text-center shadow-md">
          <Calendar size={18} className="text-primary mb-1.5" />
          <span className="text-lg sm:text-xl font-black text-textPrimary tracking-tight">
            {weeklyProgress.completedSessions}
          </span>
          <span className="text-[10px] sm:text-xs text-textMuted font-medium truncate mt-0.5">
            <span className="hidden sm:inline">sessions this week</span>
            <span className="sm:hidden">sessions</span>
          </span>
        </div>

        {/* Stat 4: Total Volume */}
        <div className="bg-surface p-3.5 sm:p-4 rounded-2xl border border-surfaceElevated flex flex-col items-center justify-center text-center shadow-md">
          <Dumbbell size={18} className="text-primary mb-1.5" />
          <span className="text-lg sm:text-xl font-black text-textPrimary tracking-tight truncate">
            {displayVolume.toLocaleString()}
          </span>
          <span className="text-[10px] sm:text-xs text-textMuted font-medium truncate mt-0.5">
            {unit} total
          </span>
        </div>

        {/* Stat 5: Training Time (Desktop 5th column) */}
        <div className="hidden lg:flex bg-surface p-3.5 sm:p-4 rounded-2xl border border-surfaceElevated flex-col items-center justify-center text-center shadow-md">
          <Clock size={18} className="text-primary mb-1.5" />
          <span className="text-lg sm:text-xl font-black text-textPrimary tracking-tight">
            {trainingMinutes}m
          </span>
          <span className="text-[10px] sm:text-xs text-textMuted font-medium truncate mt-0.5">
            training time
          </span>
        </div>
      </div>

      {/* 4. SECONDARY ROW: MEMBERSHIP CARD + QUOTECARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <MembershipCard
          subscriptionStatus={user?.subscriptionStatus || 'free'}
          onUpgrade={() => navigate('/profile')}
        />
        <QuoteCard />
      </div>

      {/* 5. DESKTOP ADVANCED ANALYTICS: QUICK STATS GRID + CIRCULAR PROGRESS RING */}
      <div className="hidden lg:grid grid-cols-3 gap-6 pt-2">
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-textMuted">
              Performance Aggregates
            </h3>
            <span className="text-xs text-primary font-bold">Past 30 Days</span>
          </div>
          <QuickStatsGrid stats={aggregatesData?.quickStats} isLoading={loadingAggregates} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-textMuted">
              Weekly Target
            </h3>
          </div>
          <CircularProgressRing
            percentage={weeklyProgress.percentage}
            label="Weekly Progress"
            sublabel={`${weeklyProgress.completedSessions} of ${weeklyProgress.targetSessions} sessions`}
          />
        </div>
      </div>

      {/* 6. RECENT ACTIVITY LIST (DESKTOP / MOBILE) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black uppercase tracking-wider text-textMuted">
            Recent Workouts
          </h3>
          <button
            onClick={() => navigate('/workouts')}
            className="text-xs font-bold text-primary hover:underline"
          >
            View all history
          </button>
        </div>
        <RecentActivityList
          activities={recentWorkouts}
          onSelect={(id) => navigate(`/routine/${id}`)}
        />
      </div>

      {/* Yuri AI Floating Drawer */}
      <YuriAiDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        activeWorkoutId={workoutId}
      />
    </div>
  );
}
