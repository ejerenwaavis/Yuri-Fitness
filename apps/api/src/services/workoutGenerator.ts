import { ExerciseModel } from '../models/Exercise';
import { UserProfile, SessionExercise } from '@yuri/shared';

interface GeneratorOptions {
  profile: UserProfile;
  focusMuscle?: string; // Optional target split e.g. 'Push', 'Pull', 'Legs', 'Full Body'
}

export const generateWorkoutRoutine = async (options: GeneratorOptions): Promise<{
  exercises: SessionExercise[];
  durationMinutes: number;
}> => {
  const { profile } = options;
  const goal = profile.goal || 'hypertrophy';
  const level = profile.level || 'beginner';
  const sessionLength = profile.sessionLength || 45;
  const userEquipment = (profile.equipment || ['Dumbbells', 'Bodyweight']).map(e => e.toLowerCase());
  const userInjuries = (profile.injuries || []).map(i => i.toLowerCase());

  // Determine target exercise count by session length
  let exerciseCount = 5;
  if (sessionLength <= 20) exerciseCount = 3;
  else if (sessionLength <= 30) exerciseCount = 4;
  else if (sessionLength <= 45) exerciseCount = 5;
  else exerciseCount = 6;

  // Determine sets and rep targets by goal
  let targetSets = 3;
  let targetReps = 10;
  if (goal === 'strength') {
    targetSets = 4;
    targetReps = 5;
  } else if (goal === 'fat_loss') {
    targetSets = 3;
    targetReps = 14;
  } else if (goal === 'endurance') {
    targetSets = 3;
    targetReps = 16;
  }

  // Fetch all exercises from DB
  const allExercises = await ExerciseModel.find({});

  // Filter exercises by equipment and injury exclusion
  const eligible = allExercises.filter(ex => {
    // Check equipment: every item in ex.equipment must be available to user
    const hasEquipment = ex.equipment.every(eq => {
      const eqLower = eq.toLowerCase();
      if (eqLower === 'bodyweight') return true;
      return userEquipment.some(ue => ue.includes(eqLower) || eqLower.includes(ue));
    });

    if (!hasEquipment) return false;

    // Check injury exclusions
    if (userInjuries.includes('knee') || userInjuries.includes('knees')) {
      if (ex.substitutionTags.includes('knee_flexion') || ex.name.toLowerCase().includes('lunge')) {
        return false;
      }
    }
    if (userInjuries.includes('lower_back') || userInjuries.includes('back')) {
      if (ex.name.toLowerCase().includes('deadlift') || ex.substitutionTags.includes('barbell_back')) {
        return false;
      }
    }
    if (userInjuries.includes('shoulder') || userInjuries.includes('shoulders')) {
      if (ex.substitutionTags.includes('vertical_press') || ex.name.toLowerCase().includes('overhead')) {
        return false;
      }
    }

    // Filter difficulty for beginners
    if (level === 'beginner' && ex.difficulty === 'advanced') {
      return false;
    }

    return true;
  });

  // Balanced routine selection: Ensure a balanced spread across push, pull, legs, core
  const selected: typeof allExercises = [];
  const muscleCategories = ['Chest', 'Back', 'Quads', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Glutes', 'Hamstrings'];
  
  // Shuffle muscle categories for variety
  const shuffledCategories = [...muscleCategories].sort(() => 0.5 - Math.random());

  for (const cat of shuffledCategories) {
    if (selected.length >= exerciseCount) break;

    const candidates = eligible.filter(e => 
      e.muscleGroups.some(m => m.toLowerCase() === cat.toLowerCase()) &&
      !selected.some(s => s._id.toString() === e._id.toString())
    );

    if (candidates.length > 0) {
      // Pick random candidate
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      selected.push(pick);
    }
  }

  // If we still need more exercises to reach exerciseCount, pick from remaining eligible
  if (selected.length < exerciseCount) {
    const remaining = eligible.filter(e => !selected.some(s => s._id.toString() === e._id.toString()));
    const needed = exerciseCount - selected.length;
    for (let i = 0; i < needed && i < remaining.length; i++) {
      selected.push(remaining[i]);
    }
  }

  // Format into SessionExercise structure
  const exercises: SessionExercise[] = selected.map(ex => ({
    exerciseId: ex._id.toString(),
    name: ex.name,
    targetSets,
    targetReps,
    targetWeight: goal === 'strength' ? 40 : 25,
    loggedSets: Array.from({ length: targetSets }, () => ({ reps: targetReps, weight: 0, completed: false })),
    mediaUrl: ex.mediaUrl,
    formCues: ex.formCues
  }));

  return {
    exercises,
    durationMinutes: sessionLength
  };
};
