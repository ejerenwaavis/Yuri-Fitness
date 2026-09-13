import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  Sparkles,
  Timer,
  Award,
  X,
  Dumbbell,
  Check,
  Film
} from 'lucide-react';
import type { WorkoutSession, SessionExercise, LoggedSet } from '@yuri/shared';
import YuriAiDrawer from '../components/YuriAiDrawer';
import { useUnit } from '../context/UnitContext';

const RPE_OPTIONS = [
  { emoji: '😫', label: 'Brutal / Failed', value: 'brutal' },
  { emoji: '😐', label: 'Tough', value: 'tough' },
  { emoji: '🙂', label: 'Target / Good', value: 'good' },
  { emoji: '💪', label: 'Strong / Solid', value: 'strong' },
  { emoji: '🔥', label: 'Invincible / Peak', value: 'peak' }
];

export default function WorkoutRunner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('yuri_token');
  const { unit, formatWeight, toDisplayWeight, fromDisplayWeight, weightPickerOptions } = useUnit();

  // Exercise navigation index
  const [currentIdx, setCurrentIdx] = useState(0);

  // Local copy of session for live editing
  const [session, setSession] = useState<WorkoutSession | null>(null);

  // Active set index within current exercise (0 to targetSets - 1)
  const [currentSetIdx, setCurrentSetIdx] = useState(0);

  // Yuri AI Drawer state
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  // Finish modal state
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [selectedRpe, setSelectedRpe] = useState<string>('💪');
  const [workoutFinished, setWorkoutFinished] = useState(false);

  // Fixed bottom queue container ref and measured width
  const queueContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth - 24 : 360
  );

  useEffect(() => {
    if (!queueContainerRef.current) return;
    const updateWidth = () => {
      if (queueContainerRef.current) {
        const w = queueContainerRef.current.clientWidth;
        if (w > 0) setContainerWidth(w);
      }
    };
    updateWidth();
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    ro.observe(queueContainerRef.current);
    window.addEventListener('resize', updateWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const getThumbnailUrl = (mediaUrl?: string): string | null => {
    if (!mediaUrl) return null;
    if (mediaUrl.includes('cloudinary.com') && mediaUrl.endsWith('.mp4')) {
      return mediaUrl.replace(/\.mp4$/i, '.jpg');
    }
    return mediaUrl.endsWith('.jpg') || mediaUrl.endsWith('.png') || mediaUrl.endsWith('.webp')
      ? mediaUrl
      : null;
  };

  // Fetch workout session
  const { data: fetchedSession, isLoading, error } = useQuery<WorkoutSession>({
    queryKey: ['workoutSession', id],
    queryFn: async () => {
      const res = await fetch(`/api/workouts/${id}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to load workout');
      return res.json();
    },
    enabled: !!id
  });

  // Keep local session state in sync
  useEffect(() => {
    if (fetchedSession && !session) {
      const initialized = { ...fetchedSession };
      if (Array.isArray(initialized.exercises)) {
        initialized.exercises = initialized.exercises.map((ex) => {
          const setsCount = ex.targetSets || 3;
          const existingLogged = ex.loggedSets || [];
          const filledLogged: LoggedSet[] = [];
          for (let i = 0; i < setsCount; i++) {
            filledLogged.push(
              existingLogged[i] || {
                reps: ex.targetReps || 10,
                weight: ex.targetWeight || 0,
                completed: false
              }
            );
          }
          return {
            ...ex,
            loggedSets: filledLogged
          };
        });
      }
      setSession(initialized);
    }
  }, [fetchedSession]);

  // Live Rest Timer Countdown
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds((s) => s - 1);
      }, 1000);
    } else if (restSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, restSeconds]);

  // Reset active set index when changing exercise
  useEffect(() => {
    setCurrentSetIdx(0);
  }, [currentIdx]);

  const startRestTimer = (secs = 60) => {
    setRestSeconds(secs);
    setTimerRunning(true);
  };

  // Sync exercises state to server asynchronously
  const saveSessionState = (updatedSession: WorkoutSession) => {
    setSession(updatedSession);
    if (!id) return;
    fetch(`/api/workouts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ exercises: updatedSession.exercises })
    }).catch((err) => console.error('Auto-save error:', err));
  };

  // Handle Weight Picker change (single tap selection, no typing)
  const handleWeightPickerChange = (displayVal: number) => {
    if (!session || !session.exercises) return;
    const updated = { ...session };
    const ex = updated.exercises[currentIdx];
    if (!ex || !ex.loggedSets) return;

    // Convert display value back to normalized kg for DB
    const normalizedKg = fromDisplayWeight(displayVal);

    // Update target and all logged sets for this exercise
    ex.targetWeight = normalizedKg;
    ex.loggedSets = ex.loggedSets.map((s) => ({
      ...s,
      weight: normalizedKg
    }));

    saveSessionState(updated);
  };

  // Mark current set or exercise done
  const handleCompleteSetOrExercise = () => {
    if (!session || !session.exercises) return;
    const updated = { ...session };
    const ex = updated.exercises[currentIdx];
    if (!ex || !ex.loggedSets) return;

    // Mark current set completed
    if (ex.loggedSets[currentSetIdx]) {
      ex.loggedSets[currentSetIdx].completed = true;
    }

    // Start rest timer
    startRestTimer(60);

    // If more sets remain in this exercise, advance set index
    if (currentSetIdx < ex.loggedSets.length - 1) {
      setCurrentSetIdx((prev) => prev + 1);
      saveSessionState(updated);
    } else {
      // All sets done for this exercise! Move to next exercise if available
      saveSessionState(updated);
      if (currentIdx < session.exercises.length - 1) {
        setTimeout(() => {
          setCurrentIdx((prev) => prev + 1);
        }, 300);
      } else {
        // Last exercise completed! Open finish modal
        setFinishModalOpen(true);
      }
    }
  };

  // Complete workout mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workouts/${id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          rpe: selectedRpe,
          exercises: session?.exercises
        })
      });
      if (!res.ok) throw new Error('Failed to complete workout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyStats'] });
      setWorkoutFinished(true);
    }
  });

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-background text-textPrimary">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !session || !session.exercises || session.exercises.length === 0) {
    return (
      <div className="h-[100dvh] flex flex-col items-center justify-center p-6 text-center bg-background text-textPrimary space-y-4">
        <Dumbbell size={48} className="text-textMuted opacity-40" />
        <h3 className="text-xl font-black">Workout session not found</h3>
        <button
          onClick={() => navigate('/workouts')}
          className="bg-primary text-black font-bold px-6 py-2.5 rounded-lg"
        >
          Return to Workouts
        </button>
      </div>
    );
  }

  const currentExercise = session.exercises[currentIdx];
  const totalExercises = session.exercises.length;

  // Active exercise weight in current display unit
  const activeWeightKg =
    currentExercise.loggedSets?.[currentSetIdx]?.weight ??
    currentExercise.targetWeight ??
    0;
  const activeDisplayWeight = toDisplayWeight(activeWeightKg);

  const completedSetsCount =
    currentExercise.loggedSets?.filter((s) => s.completed).length || 0;
  const totalSetsCount = currentExercise.loggedSets?.length || currentExercise.targetSets || 3;
  const isAllSetsDone = completedSetsCount === totalSetsCount;

  // Calculate dynamic fixed widths so the entire bottom row is 100% non-scrollable
  const inactiveCount = Math.max(1, totalExercises - 1);
  const gapSize =
    totalExercises <= 4 ? 8 : totalExercises <= 6 ? 6 : totalExercises <= 9 ? 4 : 2;
  const totalGaps = inactiveCount * gapSize;
  const availableWidth = Math.max(100, containerWidth - totalGaps);

  // Active card needs at least 140px or 52% of available width to comfortably display title + status
  const minActiveWidth = Math.min(180, Math.max(140, availableWidth * 0.52));
  const maxInactivePool = availableWidth - minActiveWidth;
  const maxPerInactive = Math.floor(maxInactivePool / inactiveCount);

  let idealTarget = 65;
  if (totalExercises === 3) idealTarget = 60;
  else if (totalExercises === 4) idealTarget = 48;
  else if (totalExercises === 5) idealTarget = 36;
  else if (totalExercises === 6) idealTarget = 26;
  else if (totalExercises <= 8) idealTarget = 18;
  else if (totalExercises <= 11) idealTarget = 12;
  else if (totalExercises <= 16) idealTarget = 6;
  else idealTarget = 2;

  const inactiveWidth = Math.max(2, Math.min(idealTarget, maxPerInactive));

  return (
    <div className="h-full w-full max-h-full overflow-hidden bg-background text-textPrimary flex flex-col p-3 gap-2 select-none">
      {/* 1. TOP HEADER BAR */}
      <div className="flex items-center justify-between shrink-0 h-10 border-b border-surfaceElevated/60 pb-2">
        <button
          onClick={() => navigate('/workouts')}
          className="text-textMuted hover:text-textPrimary text-xs font-bold flex items-center gap-1 bg-surfaceElevated px-3 py-1.5 rounded-full transition-colors active:scale-95"
        >
          <ChevronLeft size={16} /> Exit
        </button>

        {/* Yuri AI Center Pill */}
        <button
          onClick={() => setIsAiOpen(true)}
          className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 font-black px-3.5 py-1.5 rounded-full text-xs transition-all shadow-[0_0_12px_rgba(124,255,61,0.2)] active:scale-95"
        >
          <Sparkles size={14} />
          <span>Yuri AI</span>
        </button>

        {/* Finish Button */}
        <button
          onClick={() => setFinishModalOpen(true)}
          className="bg-surfaceElevated border border-primary/40 text-primary hover:bg-primary hover:text-black font-black text-xs px-4 py-1.5 rounded-full shadow-sm active:scale-95 transition-all"
        >
          Finish
        </button>
      </div>

      {/* 2. MAIN ACTIVE EXERCISE WORKSPACE (NON-SCROLLABLE) */}
      <div className="flex-1 min-h-0 w-full rounded-2xl bg-surface border border-surfaceElevated overflow-hidden relative flex flex-col justify-between p-3 shadow-lg">
        {/* Top Pill with Exercise Name */}
        <div className="z-10 flex items-center justify-between">
          <span className="bg-surface/90 backdrop-blur-md border border-primary/40 text-primary font-black text-xs px-3 py-1 rounded-full shadow-sm">
            {currentExercise.name}
          </span>

          {/* Set Progress Badge */}
          <span className="text-[11px] font-bold text-textMuted bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-surfaceElevated">
            Set {currentSetIdx + 1} of {totalSetsCount}
          </span>
        </div>

        {/* Video or Center Play Visual */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-surface/40 to-surface">
          {currentExercise.mediaUrl ? (
            <video
              key={currentExercise.mediaUrl}
              src={currentExercise.mediaUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-surfaceElevated border border-surfaceElevated flex items-center justify-center text-textMuted shadow-md">
              <Play size={28} className="translate-x-0.5 text-textPrimary opacity-80" />
            </div>
          )}
        </div>

        {/* Rest Timer Overlay Banner if counting down */}
        {timerRunning && (
          <div className="z-10 bg-black/85 backdrop-blur-md border border-primary/40 rounded-xl p-2 flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <Timer size={16} className="text-primary animate-pulse" />
              <span className="font-black text-textPrimary">
                Rest: {Math.floor(restSeconds / 60)}:
                {restSeconds % 60 < 10 ? '0' : ''}
                {restSeconds % 60}
              </span>
            </div>
            <button
              onClick={() => setRestSeconds(0)}
              className="text-[10px] font-bold text-primary hover:underline px-2 py-0.5"
            >
              Skip Rest
            </button>
          </div>
        )}
      </div>

      {/* 3. SET TARGETS & WEIGHT PICKER ROW */}
      <div className="shrink-0 flex items-center justify-between bg-surface border border-surfaceElevated rounded-2xl px-4 py-2.5">
        {/* Target Sets & Reps */}
        <div className="flex flex-col">
          <span className="text-sm font-black text-textPrimary tracking-tight">
            {totalSetsCount} sets × {currentExercise.targetReps || 10} reps
          </span>
          {/* Set completion indicator dots */}
          <div className="flex items-center gap-1.5 mt-1">
            {Array.from({ length: totalSetsCount }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentExercise.loggedSets?.[i]?.completed
                    ? 'bg-primary shadow-[0_0_6px_rgba(124,255,61,0.6)]'
                    : i === currentSetIdx
                    ? 'bg-primary scale-110 shadow-[0_0_8px_rgba(124,255,61,0.8)]'
                    : 'bg-surfaceElevated border border-surfaceElevated'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Single-Tap Weight Picker Dropdown (No Software Keyboard!) */}
        <div className="relative">
          <select
            value={activeDisplayWeight}
            onChange={(e) => handleWeightPickerChange(Number(e.target.value))}
            className="appearance-none bg-surfaceElevated hover:bg-surface border border-surfaceElevated focus:border-primary px-4 py-2 pr-8 rounded-xl font-black text-sm text-textPrimary cursor-pointer outline-none shadow-sm transition-all focus:ring-1 focus:ring-primary/40"
          >
            {weightPickerOptions.map((opt) => (
              <option key={opt} value={opt} className="bg-surface text-textPrimary font-bold">
                {opt === 0 ? 'Bodyweight' : `${opt} ${unit}`}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-textMuted"
          />
        </div>
      </div>

      {/* 4. PRIMARY ACTION BUTTON: "✓ Exercise done" */}
      <button
        onClick={handleCompleteSetOrExercise}
        className="shrink-0 w-full bg-primary text-black font-black py-3.5 rounded-2xl shadow-[0_0_20px_rgba(124,255,61,0.35)] hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-base"
      >
        <Check size={20} strokeWidth={3} />
        <span>
          {isAllSetsDone
            ? 'Exercise done'
            : currentSetIdx < totalSetsCount - 1
            ? `Done with Set ${currentSetIdx + 1}`
            : 'Exercise done'}
        </span>
      </button>

      {/* 5. BOTTOM FIXED QUEUE ROW (STRICTLY NON-SCROLLABLE ACCORDION) */}
      <div className="shrink-0 w-full pt-1 border-t border-surfaceElevated/50">
        <div
          ref={queueContainerRef}
          style={{ gap: `${gapSize}px` }}
          className="w-full flex items-center overflow-hidden py-1 select-none"
        >
          {session.exercises.map((ex, idx) => {
            const isActive = idx === currentIdx;
            const isCompleted =
              ex.loggedSets &&
              ex.loggedSets.length > 0 &&
              ex.loggedSets.every((s) => s.completed);
            const thumb = getThumbnailUrl(ex.mediaUrl);

            if (isActive) {
              return (
                <div
                  key={idx}
                  onClick={() => setCurrentIdx(idx)}
                  className="flex-1 min-w-0 h-14 rounded-2xl px-3 py-1.5 flex items-center gap-2.5 cursor-pointer bg-surface border-2 border-primary shadow-[0_0_15px_rgba(124,255,61,0.25)] transition-all duration-300 ease-out select-none"
                >
                  {/* Play / Check Icon Badge */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isCompleted
                        ? 'bg-primary text-black font-black shadow-sm'
                        : 'bg-primary/20 text-primary border border-primary/40'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={16} strokeWidth={3} />
                    ) : (
                      <Play size={14} fill="currentColor" />
                    )}
                  </div>

                  {/* Exercise Title and Status */}
                  <div className="flex-1 min-w-0 overflow-hidden text-left">
                    <h4 className="text-xs font-black text-textPrimary truncate leading-tight">
                      {ex.name}
                    </h4>
                    <span className="text-[10px] font-bold text-primary block truncate leading-tight mt-0.5">
                      {isCompleted
                        ? '✓ Completed'
                        : `Active • Set ${currentSetIdx + 1} of ${totalSetsCount}`}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={idx}
                onClick={() => setCurrentIdx(idx)}
                style={{ width: `${inactiveWidth}px`, flexShrink: 0 }}
                title={`${ex.name}${isCompleted ? ' (Completed)' : ''}`}
                role="button"
                tabIndex={0}
                className={`h-14 rounded-2xl cursor-pointer select-none transition-all duration-300 ease-out overflow-hidden relative flex items-center justify-center ${
                  inactiveWidth < 12
                    ? isCompleted
                      ? 'bg-primary shadow-[0_0_6px_rgba(124,255,61,0.6)]'
                      : 'bg-surfaceElevated hover:bg-surfaceElevated/80'
                    : isCompleted
                    ? 'bg-surfaceElevated border border-primary/40 text-primary'
                    : 'bg-surfaceElevated/70 border border-surfaceElevated text-textMuted hover:border-textMuted/60'
                }`}
              >
                {inactiveWidth >= 48 ? (
                  <>
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={ex.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/40" />
                    <div
                      className={`z-10 w-6 h-6 rounded-lg flex items-center justify-center ${
                        isCompleted
                          ? 'bg-primary text-black font-black'
                          : 'bg-surfaceElevated/90 text-textMuted border border-surfaceElevated'
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <Play size={12} fill="currentColor" />
                      )}
                    </div>
                  </>
                ) : inactiveWidth >= 22 ? (
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      isCompleted ? 'bg-primary text-black font-black' : 'text-textMuted/70'
                    }`}
                  >
                    {isCompleted ? (
                      <Check size={12} strokeWidth={3} />
                    ) : (
                      <Play size={10} fill="currentColor" />
                    )}
                  </div>
                ) : inactiveWidth >= 10 ? (
                  <div
                    className={`w-full h-full rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-primary' : 'bg-surfaceElevated border border-surfaceElevated'
                    }`}
                  >
                    {isCompleted && inactiveWidth >= 14 && (
                      <Check size={10} strokeWidth={3} className="text-black" />
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Yuri AI Assistant Drawer */}
      <YuriAiDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        activeWorkoutId={id}
        currentExerciseName={currentExercise?.name}
        onWorkoutMutated={(mutated) => {
          setSession(mutated);
          if (currentIdx >= (mutated.exercises?.length || 1)) {
            setCurrentIdx(Math.max(0, (mutated.exercises?.length || 1) - 1));
          }
        }}
      />

      {/* Finish & Emoji RPE Modal */}
      {finishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-surfaceElevated rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            {!workoutFinished ? (
              <>
                <div className="flex items-center justify-between border-b border-surfaceElevated pb-3">
                  <div>
                    <h3 className="text-xl font-black text-textPrimary">Workout Complete!</h3>
                    <p className="text-xs text-textMuted">Rate your overall perceived exertion (RPE)</p>
                  </div>
                  <button
                    onClick={() => setFinishModalOpen(false)}
                    className="p-1.5 rounded-full text-textMuted hover:text-textPrimary bg-surfaceElevated"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Emoji RPE Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-textMuted tracking-wider">
                    How was this session?
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {RPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedRpe(opt.emoji)}
                        className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                          selectedRpe === opt.emoji
                            ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_rgba(124,255,61,0.3)] scale-105'
                            : 'bg-surfaceElevated border-surfaceElevated hover:border-textMuted'
                        }`}
                      >
                        <span className="text-3xl mb-1">{opt.emoji}</span>
                        <span className="text-[9px] font-bold text-textMuted text-center leading-tight">
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Info */}
                <div className="p-3 bg-surfaceElevated/60 border border-surfaceElevated rounded-2xl space-y-1 text-xs text-textMuted">
                  <div className="flex justify-between">
                    <span>Exercises Completed:</span>
                    <span className="font-bold text-textPrimary">{totalExercises}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Duration:</span>
                    <span className="font-bold text-textPrimary">{session.durationMinutes || 45} min</span>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="button"
                  disabled={completeMutation.isPending}
                  onClick={() => completeMutation.mutate()}
                  className="w-full py-3.5 bg-primary text-black font-black rounded-2xl shadow-[0_0_20px_rgba(124,255,61,0.35)] hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50"
                >
                  {completeMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Log & Finish</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 text-primary flex items-center justify-center mx-auto border border-primary/40 shadow-[0_0_20px_rgba(124,255,61,0.4)]">
                  <Award size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-textPrimary">Great Work!</h3>
                  <p className="text-xs text-textMuted mt-1">
                    Your workout session and volume have been recorded.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3.5 bg-primary text-black font-black rounded-2xl hover:opacity-90 shadow-md"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
