import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
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

  // Exercise navigation index
  const [currentIdx, setCurrentIdx] = useState(0);

  // Local copy of session for live editing
  const [session, setSession] = useState<WorkoutSession | null>(null);

  // Yuri AI Drawer state
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInitial, setTimerInitial] = useState(90);

  // Finish modal state
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [selectedRpe, setSelectedRpe] = useState<string>('💪');
  const [workoutFinished, setWorkoutFinished] = useState(false);

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
      // Initialize loggedSets if empty
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

  const startTimer = (seconds: number) => {
    setTimerInitial(seconds);
    setRestSeconds(seconds);
    setTimerRunning(true);
  };

  const toggleTimer = () => {
    setTimerRunning((r) => !r);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setRestSeconds(timerInitial);
  };

  // Update a specific set's logged data (reps, weight, completed)
  const handleUpdateSet = (setIndex: number, field: keyof LoggedSet, value: any) => {
    if (!session || !session.exercises) return;

    const updated = { ...session };
    const ex = updated.exercises[currentIdx];
    if (!ex || !ex.loggedSets) return;

    const currentSet = { ...ex.loggedSets[setIndex], [field]: value };
    ex.loggedSets[setIndex] = currentSet;

    // If marked completed, automatically trigger rest timer
    if (field === 'completed' && value === true) {
      startTimer(90);
    }

    setSession(updated);

    // Save progress to server asynchronously
    fetch(`/api/workouts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ exercises: updated.exercises })
    }).catch((err) => console.error('Auto-save set error:', err));
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
      <div className="min-h-screen flex items-center justify-center bg-background text-textPrimary">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !session || !session.exercises || session.exercises.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-textPrimary space-y-4">
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

  // Format timer seconds into MM:SS
  const timerMinutes = Math.floor(restSeconds / 60);
  const timerSecs = restSeconds % 60;
  const formattedTime = `${timerMinutes}:${timerSecs < 10 ? '0' : ''}${timerSecs}`;

  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col justify-between p-4 sm:p-6 max-w-2xl mx-auto pb-28 lg:pb-8">
      {/* Top Header Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/workouts')}
            className="text-textMuted hover:text-textPrimary text-xs font-semibold flex items-center gap-1 bg-surfaceElevated px-3 py-1.5 rounded-lg"
          >
            <ChevronLeft size={16} /> Exit
          </button>

          {/* Yuri AI Live Coach Button */}
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-2 bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 font-bold px-3 py-1.5 rounded-full text-xs transition-all shadow-[0_0_12px_rgba(124,255,61,0.2)] animate-pulse"
          >
            <Sparkles size={14} />
            <span>Yuri AI Swaps</span>
          </button>

          <button
            onClick={() => setFinishModalOpen(true)}
            className="bg-primary text-black font-black text-xs px-3.5 py-1.5 rounded-lg hover:opacity-90 shadow-md"
          >
            Finish
          </button>
        </div>

        {/* Progress Dots / Bar */}
        <div className="flex items-center justify-between text-xs text-textMuted">
          <span className="font-bold">
            Exercise {currentIdx + 1} of {totalExercises}
          </span>
          <span className="text-primary font-bold">{Math.round(((currentIdx + 1) / totalExercises) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-surfaceElevated rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${((currentIdx + 1) / totalExercises) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="my-auto py-4 space-y-5">
        {/* Exercise Header Card */}
        <div className="bg-surface border border-surfaceElevated rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                {currentExercise.equipment || 'Equipment'}
              </span>
              <h2 className="text-2xl font-black text-textPrimary tracking-tight mt-2">
                {currentExercise.name}
              </h2>
              <p className="text-xs text-textMuted mt-0.5">
                Target: {currentExercise.targetSets || 3} sets × {currentExercise.targetReps || 10} reps
                {currentExercise.targetWeight ? ` @ ${currentExercise.targetWeight} kg` : ''}
              </p>
            </div>
          </div>

          {/* Form Cues / Media embed preview */}
          {currentExercise.mediaUrl ? (
            <div className="rounded-xl overflow-hidden bg-black/40 border border-surfaceElevated max-h-56 flex items-center justify-center">
              <video
                src={currentExercise.mediaUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="p-4 bg-surfaceElevated/50 border border-surfaceElevated rounded-xl flex items-center gap-3">
              <Film size={24} className="text-primary shrink-0 opacity-70" />
              <div className="text-xs text-textMuted">
                <span className="font-bold text-textPrimary block mb-0.5">Form Execution Note</span>
                Focus on smooth eccentric control and strict joint alignment through full range of motion.
              </div>
            </div>
          )}
        </div>

        {/* Set Logging Table */}
        <div className="bg-surface border border-surfaceElevated rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-textMuted tracking-wider px-2">
            <span>Set</span>
            <span>Target</span>
            <span>Reps</span>
            <span>Weight (kg/lbs)</span>
            <span>Done</span>
          </div>

          <div className="space-y-2">
            {currentExercise.loggedSets?.map((set, idx) => {
              const isCompleted = set.completed;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-primary/10 border-primary/40'
                      : 'bg-surfaceElevated/60 border-surfaceElevated'
                  }`}
                >
                  <div className="w-8 text-center font-bold text-sm text-textPrimary">{idx + 1}</div>
                  <div className="text-xs text-textMuted w-16 text-center">
                    {currentExercise.targetReps} reps
                  </div>

                  {/* Logged Reps Input */}
                  <input
                    type="number"
                    value={set.reps || ''}
                    onChange={(e) => handleUpdateSet(idx, 'reps', Number(e.target.value))}
                    className="w-16 bg-surface border border-surfaceElevated rounded-lg py-1.5 text-center text-sm font-bold text-textPrimary focus:outline-none focus:border-primary"
                  />

                  {/* Logged Weight Input */}
                  <input
                    type="number"
                    step="0.5"
                    value={set.weight || ''}
                    onChange={(e) => handleUpdateSet(idx, 'weight', Number(e.target.value))}
                    className="w-20 bg-surface border border-surfaceElevated rounded-lg py-1.5 text-center text-sm font-bold text-textPrimary focus:outline-none focus:border-primary"
                  />

                  {/* Complete Set Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleUpdateSet(idx, 'completed', !isCompleted)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-primary text-black shadow-[0_0_10px_rgba(124,255,61,0.3)]'
                        : 'bg-surface border border-surfaceElevated text-textMuted hover:border-textPrimary'
                    }`}
                  >
                    <Check size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Rest Timer Widget */}
        <div className="bg-surfaceElevated/70 border border-surfaceElevated rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${timerRunning ? 'bg-primary text-black' : 'bg-surface text-primary'}`}>
              <Timer size={20} />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-textPrimary">{formattedTime}</div>
              <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Rest Stopwatch</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => startTimer(60)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-surface border border-surfaceElevated text-textMuted hover:text-textPrimary"
            >
              60s
            </button>
            <button
              onClick={() => startTimer(90)}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-surface border border-surfaceElevated text-textMuted hover:text-textPrimary"
            >
              90s
            </button>
            <button
              onClick={toggleTimer}
              className="p-2 rounded-lg bg-primary text-black font-bold hover:opacity-90 transition-opacity"
            >
              {timerRunning ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button
              onClick={resetTimer}
              className="p-2 rounded-lg bg-surface border border-surfaceElevated text-textMuted hover:text-textPrimary"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-surfaceElevated">
        <button
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => i - 1)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-surfaceElevated text-textPrimary text-sm font-bold disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={18} /> Prev
        </button>

        {currentIdx < totalExercises - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => i + 1)}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-black shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 transition-all"
          >
            Next <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={() => setFinishModalOpen(true)}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-black shadow-[0_0_20px_rgba(124,255,61,0.4)] hover:opacity-90 transition-all"
          >
            <Award size={18} /> Finish Workout
          </button>
        )}
      </div>

      {/* Yuri AI Assistant Drawer */}
      <YuriAiDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        activeWorkoutId={id}
        currentExerciseName={currentExercise?.name}
        onWorkoutMutated={(mutated) => {
          setSession(mutated);
          // Clamp index if exercises were shortened
          if (currentIdx >= (mutated.exercises?.length || 1)) {
            setCurrentIdx(Math.max(0, (mutated.exercises?.length || 1) - 1));
          }
        }}
      />

      {/* Finish & Emoji RPE Modal */}
      {finishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-surfaceElevated rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            {!workoutFinished ? (
              <>
                <div className="flex items-center justify-between border-b border-surfaceElevated pb-3">
                  <div>
                    <h3 className="text-xl font-black text-textPrimary">Workout Complete!</h3>
                    <p className="text-xs text-textMuted">Rate your overall perceived exertion (RPE)</p>
                  </div>
                  <button
                    onClick={() => setFinishModalOpen(false)}
                    className="p-1.5 rounded-lg text-textMuted hover:text-textPrimary bg-surfaceElevated"
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
                        className={`flex flex-col items-center p-3 rounded-xl border transition-all ${
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
                <div className="p-3 bg-surfaceElevated/60 border border-surfaceElevated rounded-xl space-y-1 text-xs text-textMuted">
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
                  className="w-full py-3 bg-primary text-black font-black rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(124,255,61,0.3)] flex items-center justify-center gap-2"
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
                  className="w-full py-3 bg-primary text-black font-black rounded-xl hover:opacity-90"
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
