import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, ChevronRight, Film, Plus, Trash2, X, Dumbbell, Clock, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { WorkoutSession, Exercise } from '@yuri/shared';
import { useUnit } from '../context/UnitContext';

export default function Workouts() {
  const { t } = useTranslation();
  const { unit, formatWeight, toDisplayWeight, fromDisplayWeight } = useUnit();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('yuri_token');

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  // New workout form state
  const [workoutDate, setWorkoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [exerciseList, setExerciseList] = useState<Exercise[]>([
    { name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: 60 }
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch real workout sessions
  const { data: workouts = [], isLoading } = useQuery<WorkoutSession[]>({
    queryKey: ['workouts'],
    queryFn: async () => {
      const res = await fetch('/api/workouts', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to fetch workouts');
      return res.json();
    }
  });

  // Log workout mutation
  const logMutation = useMutation({
    mutationFn: async (newSession: Partial<WorkoutSession>) => {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newSession)
      });
      if (!res.ok) throw new Error('Failed to log workout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyStats'] });
      setIsLogModalOpen(false);
      // Reset form
      setExerciseList([{ name: '', sets: 3, reps: 10, weight: 0 }]);
    }
  });

  const handleAddExerciseRow = () => {
    setExerciseList([
      ...exerciseList,
      { name: '', sets: 3, reps: 10, weight: 0 }
    ]);
  };

  const handleRemoveExerciseRow = (index: number) => {
    if (exerciseList.length === 1) return;
    setExerciseList(exerciseList.filter((_, idx) => idx !== index));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exerciseList];
    updated[index] = { ...updated[index], [field]: value };
    setExerciseList(updated);
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const validExercises = exerciseList.filter(ex => ex.name.trim().length > 0);
    if (validExercises.length === 0) {
      setFormError('Please enter at least one exercise name');
      return;
    }

    logMutation.mutate({
      date: new Date(workoutDate).toISOString(),
      durationMinutes: Number(durationMinutes) || 30,
      exercises: validExercises.map((ex) => {
        const dbWeight = fromDisplayWeight(Number(ex.weight) || 0);
        return {
          name: ex.name,
          targetSets: ex.sets || 3,
          targetReps: ex.reps || 10,
          targetWeight: dbWeight,
          loggedSets: Array.from({ length: ex.sets || 3 }, () => ({
            reps: ex.reps || 10,
            weight: dbWeight,
            completed: true
          }))
        };
      })
    });
  };

  const calculateSessionVolume = (session: WorkoutSession): number => {
    if (!session.exercises) return 0;
    return session.exercises.reduce((total, ex) => {
      if (Array.isArray(ex.loggedSets) && ex.loggedSets.length > 0) {
        const loggedVol = ex.loggedSets.reduce(
          (sum, s) => sum + ((s.reps || 0) * toDisplayWeight(s.weight || 0)),
          0
        );
        return total + loggedVol;
      }
      const sets = ex.targetSets || ex.sets || 0;
      const reps = ex.targetReps || ex.reps || 0;
      const weight = toDisplayWeight(ex.targetWeight || ex.weight || 0);
      return total + (sets * reps * weight);
    }, 0);
  };

  const getExerciseLoggedWeight = (ex: any) => {
    // Pull from actual logged user input in loggedSets first
    if (Array.isArray(ex.loggedSets) && ex.loggedSets.length > 0) {
      const validWeights = ex.loggedSets
        .map((s: any) => s.weight)
        .filter((w: any) => typeof w === 'number' && !isNaN(w));
      if (validWeights.length > 0) {
        const actualLogged = validWeights[validWeights.length - 1];
        if (actualLogged === 0) return 'Bodyweight';
        return formatWeight(actualLogged);
      }
    }
    const val = ex.weight || ex.targetWeight || 0;
    if (val === 0) return 'Bodyweight';
    return formatWeight(val);
  };

  return (
    <div className="p-4 sm:p-6 pb-28 lg:pb-8 space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-textPrimary tracking-tight">{t('workouts.title')}</h2>
          <p className="text-sm text-textMuted">{t('workouts.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/exercises"
            className="inline-flex items-center gap-2 bg-surfaceElevated hover:bg-primary/20 text-primary border border-primary/30 font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <Film size={18} />
            <span className="hidden sm:inline">{t('workouts.browseLibrary')}</span>
          </Link>
          <button
            onClick={() => { setFormError(null); setIsLogModalOpen(true); }}
            className="inline-flex items-center gap-2 bg-primary text-black font-bold px-4 py-2.5 rounded-lg shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 transition-opacity text-sm"
          >
            <Plus size={18} />
            <span>{t('nav.logWorkout')}</span>
          </button>
        </div>
      </div>

      {/* Workout Sessions History */}
      {isLoading ? (
        <div className="text-textMuted text-center py-12">{t('workouts.loading')}</div>
      ) : (
        <div className="space-y-3">
          {workouts.map((w: any) => {
            const id = w._id || w.id;
            const volume = calculateSessionVolume(w);

            return (
              <div
                key={id}
                onClick={() => setSelectedSession(w)}
                className="bg-surface p-4 rounded-xl border border-surfaceElevated flex items-center justify-between hover:border-primary/50 transition-all cursor-pointer group shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-surfaceElevated p-3 rounded-lg text-primary group-hover:scale-105 transition-transform">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base sm:text-lg text-textPrimary group-hover:text-primary transition-colors">
                      {new Date(w.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </h4>
                    <p className="text-sm text-textMuted mt-0.5">
                      {w.exercises?.length || 0} {t('workouts.exercises')} • {w.durationMinutes} {t('workouts.min')}
                      {volume > 0 && ` • ${volume.toLocaleString()} ${unit}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-textMuted group-hover:text-primary transition-colors">
                  <span className="text-sm font-semibold hidden sm:inline">{t('workouts.sessionDetails')}</span>
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })}

          {workouts.length === 0 && (
            <div className="text-center p-12 border border-dashed border-surfaceElevated rounded-2xl bg-surfaceElevated/20 space-y-3">
              <Dumbbell className="mx-auto text-textMuted opacity-40" size={40} />
              <p className="text-textMuted font-medium text-sm">{t('workouts.empty')}</p>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="text-xs text-primary font-bold hover:underline"
              >
                + {t('nav.logWorkout')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-surfaceElevated rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-surfaceElevated pb-3">
              <div>
                <h3 className="text-xl font-black text-textPrimary">
                  {new Date(selectedSession.date).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="flex items-center gap-3 text-xs text-textMuted mt-0.5">
                  <span className="flex items-center gap-1"><Clock size={13} /> {selectedSession.durationMinutes} min</span>
                  <span>•</span>
                  <span>{selectedSession.exercises?.length || 0} exercises</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-textMuted hover:text-textPrimary p-2 rounded-lg bg-surfaceElevated transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Exercise Breakdown Table */}
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {selectedSession.exercises?.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surfaceElevated/60 border border-surfaceElevated rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h5 className="font-bold text-sm text-textPrimary">{ex.name}</h5>
                    <span className="text-xs text-textMuted">
                      {ex.targetSets || ex.sets || 3} sets × {ex.targetReps || ex.reps || 10} reps
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-primary">
                      {getExerciseLoggedWeight(ex)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-surfaceElevated text-xs text-textMuted">
              <span>{t('workouts.totalVolume')}:</span>
              <span className="text-sm font-black text-primary">
                {calculateSessionVolume(selectedSession).toLocaleString()} {unit}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick-Log Workout Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface border border-surfaceElevated rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-surfaceElevated pb-3">
              <div>
                <h3 className="text-xl font-black text-textPrimary">{t('workouts.logWorkoutModalTitle')}</h3>
                <p className="text-xs text-textMuted">Quickly save your exercises, sets, reps, and weights</p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-textMuted hover:text-textPrimary p-1.5 rounded-lg bg-surfaceElevated"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleLogSubmit} className="space-y-4">
              {/* Date & Duration Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1">{t('workouts.date')}</label>
                  <input
                    type="date"
                    required
                    value={workoutDate}
                    onChange={(e) => setWorkoutDate(e.target.value)}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textMuted mb-1">{t('workouts.duration')}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full bg-surfaceElevated border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-textMuted tracking-wider">
                    {t('workouts.exercises')}
                  </span>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> {t('workouts.addExercise')}
                  </button>
                </div>

                {exerciseList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surfaceElevated/60 border border-surfaceElevated rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder={t('workouts.exercisePlaceholder')}
                        required
                        value={item.name}
                        onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                        className="flex-1 bg-surface border border-surfaceElevated rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:border-primary"
                      />
                      {exerciseList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExerciseRow(idx)}
                          className="text-textMuted hover:text-red-400 p-1.5 rounded"
                          title={t('workouts.remove')}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-textMuted uppercase font-bold mb-0.5">{t('workouts.sets')}</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.sets}
                          onChange={(e) => handleExerciseChange(idx, 'sets', Number(e.target.value))}
                          className="w-full bg-surface border border-surfaceElevated rounded-lg px-2 py-1.5 text-sm text-textPrimary text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-textMuted uppercase font-bold mb-0.5">{t('workouts.reps')}</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.reps}
                          onChange={(e) => handleExerciseChange(idx, 'reps', Number(e.target.value))}
                          className="w-full bg-surface border border-surfaceElevated rounded-lg px-2 py-1.5 text-sm text-textPrimary text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-textMuted uppercase font-bold mb-0.5">{t('workouts.weight')} ({unit})</label>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={item.weight}
                          onChange={(e) => handleExerciseChange(idx, 'weight', Number(e.target.value))}
                          className="w-full bg-surface border border-surfaceElevated rounded-lg px-2 py-1.5 text-sm text-textPrimary text-center"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surfaceElevated">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg text-sm text-textMuted hover:text-textPrimary bg-surfaceElevated transition-colors"
                >
                  {t('workouts.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={logMutation.isPending}
                  className="flex items-center gap-2 bg-primary text-black font-bold px-5 py-2.5 rounded-lg shadow-[0_0_15px_rgba(124,255,61,0.3)] hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
                >
                  {logMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>{t('workouts.saveWorkout')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
