import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  Play,
  Clock,
  Dumbbell,
  Target,
  Flame,
  Zap,
  ArrowRight,
  Layers
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ExerciseThumbnailCard from '../components/ExerciseThumbnailCard';
import { CINEMATIC_ASSETS, getDuotoneImageUrl } from '../utils/imagePipeline';
import type { WorkoutSession } from '@yuri/shared';

export default function RoutineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = localStorage.getItem('yuri_token');

  // Fetch session: if id === 'today', pull today's active session, else by ID
  const isToday = !id || id === 'today';
  const fetchUrl = isToday ? '/api/workouts/today' : `/api/workouts/${id}`;

  const { data: session, isLoading, error } = useQuery<WorkoutSession>({
    queryKey: ['routineDetail', id],
    queryFn: async () => {
      const res = await fetch(fetchUrl, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
      });
      if (!res.ok) throw new Error('Failed to load routine');
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-textPrimary">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Dumbbell size={48} className="text-textMuted opacity-40" />
        <h3 className="text-xl font-black text-textPrimary">Routine not found</h3>
        <button
          onClick={() => navigate('/')}
          className="bg-primary text-black font-bold px-6 py-2.5 rounded-xl"
        >
          Return Home
        </button>
      </div>
    );
  }

  const sessionAny = session as any;
  const workoutId = sessionAny._id || sessionAny.id;
  const exercises = sessionAny.exercises || [];
  const duration = sessionAny.durationMinutes || 45;

  // Derive descriptors from goal or title
  const goalLower = (sessionAny.goal || '').toLowerCase();
  const intensityText = goalLower.includes('strength')
    ? 'Maximum neuromuscular recruitment'
    : goalLower.includes('endurance')
    ? 'High work capacity & stamina'
    : goalLower.includes('fat_loss')
    ? 'High metabolic output & density'
    : 'Hypertrophic volume & tension';

  const repTargetText = goalLower.includes('strength')
    ? '4-6 heavy reps'
    : goalLower.includes('endurance')
    ? '15+ reps per set'
    : '8-12 reps per set';

  const paceText = goalLower.includes('strength')
    ? 'Controlled cadence'
    : goalLower.includes('endurance')
    ? 'Athletic pace'
    : 'Moderate tempo';

  const routineDescription =
    sessionAny.description ||
    `Programmed specifically for progressive overload and neuromuscular adaptation. This session combines compound movements with accessory supersets to maximize muscular tension and metabolic demand in ${duration} minutes.`;

  return (
    <div className="p-4 sm:p-6 pb-28 lg:pb-8 space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP BAR: Back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-textMuted hover:text-textPrimary bg-surfaceElevated px-3.5 py-1.5 rounded-full transition-colors active:scale-95"
        >
          <ChevronLeft size={18} />
          <span>Routine</span>
        </button>

        <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-1">
          <Clock size={13} />
          <span>{duration} min</span>
        </span>
      </div>

      {/* 2. HERO HEADER: Right-bleeding photo with vertical accent line */}
      <div className="relative rounded-3xl bg-surface border border-surfaceElevated overflow-hidden shadow-2xl">
        {/* Right half hero action photography with duotone bleed */}
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-3/5 overflow-hidden pointer-events-none">
          <img
            src={CINEMATIC_ASSETS.ROUTINE_HERO}
            alt="Routine Athlete Hero"
            className="w-full h-full object-cover object-top filter grayscale contrast-125 brightness-75"
          />
          {/* Gradient blend from left to right */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 md:via-surface/70 to-transparent" />
          {/* Subtle green rim light */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-primary/10" />
          {/* Thin vertical accent line */}
          <div className="hidden md:block absolute left-0 top-6 bottom-6 w-[1px] bg-gradient-to-b from-transparent via-primary/60 to-transparent" />
        </div>

        {/* Content on the left */}
        <div className="relative z-10 p-6 sm:p-8 max-w-2xl space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary block mb-2">
              — Today's Routine
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-textPrimary tracking-tight leading-tight">
              {sessionAny.title || 'Dynamic Strength & Conditioning'}
            </h1>
          </div>

          {/* Meta Row with Icons */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-bold text-textMuted pt-1">
            <span className="flex items-center gap-1.5 bg-surfaceElevated/80 px-2.5 py-1 rounded-lg border border-surfaceElevated">
              <Dumbbell size={14} className="text-primary" />
              <span>{exercises.length} exercises</span>
            </span>
            <span className="flex items-center gap-1.5 bg-surfaceElevated/80 px-2.5 py-1 rounded-lg border border-surfaceElevated">
              <Target size={14} className="text-primary" />
              <span>{repTargetText}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-surfaceElevated/80 px-2.5 py-1 rounded-lg border border-surfaceElevated">
              <Zap size={14} className="text-primary" />
              <span>{intensityText}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-surfaceElevated/80 px-2.5 py-1 rounded-lg border border-surfaceElevated">
              <Clock size={14} className="text-primary" />
              <span>{paceText}</span>
            </span>
          </div>

          {/* Description Paragraph */}
          <p className="text-sm text-textMuted leading-relaxed max-w-xl">
            {routineDescription}
          </p>

          {/* Primary Action Button: Start Workout */}
          <div className="pt-2">
            <button
              onClick={() => navigate(`/runner/${workoutId}`)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary text-black font-black text-base px-8 py-3.5 rounded-2xl shadow-[0_0_20px_rgba(124,255,61,0.4)] hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Play size={20} fill="currentColor" />
              <span>Start Workout</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. EXERCISE LINEUP GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            <h3 className="text-lg font-black text-textPrimary uppercase tracking-wider">
              Exercise Lineup
            </h3>
          </div>
          <span className="text-xs font-bold text-textMuted bg-surfaceElevated px-3 py-1 rounded-full border border-surfaceElevated">
            {exercises.length} Movements
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex: any, idx: number) => (
            <ExerciseThumbnailCard
              key={idx}
              index={idx}
              name={ex.name}
              targetSets={ex.targetSets || ex.sets || 3}
              targetReps={ex.targetReps || ex.reps || 10}
              mediaUrl={ex.mediaUrl}
              onClick={() => navigate(`/runner/${workoutId}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
