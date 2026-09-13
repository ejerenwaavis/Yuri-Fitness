"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWorkoutRoutine = void 0;
const Exercise_1 = require("../models/Exercise");
const generateWorkoutRoutine = async (options) => {
    const { profile } = options;
    const goal = profile.goal || 'hypertrophy';
    const level = profile.level || 'beginner';
    const sessionLength = profile.sessionLength || 45;
    const userEquipment = (profile.equipment || ['Dumbbells', 'Bodyweight']).map(e => e.toLowerCase());
    const userInjuries = (profile.injuries || []).map(i => i.toLowerCase());
    // Determine target exercise count by session length
    let exerciseCount = 5;
    if (sessionLength <= 20)
        exerciseCount = 3;
    else if (sessionLength <= 30)
        exerciseCount = 4;
    else if (sessionLength <= 45)
        exerciseCount = 5;
    else
        exerciseCount = 6;
    // Determine sets, rep targets and routine title by goal
    let targetSets = 3;
    let targetReps = 10;
    let title = 'Hypertrophy & Muscle Growth Split';
    if (goal === 'strength') {
        targetSets = 4;
        targetReps = 5;
        title = 'Raw Strength & Power Focus';
    }
    else if (goal === 'fat_loss') {
        targetSets = 3;
        targetReps = 14;
        title = 'Metabolic Conditioning & Burn';
    }
    else if (goal === 'endurance') {
        targetSets = 3;
        targetReps = 16;
        title = 'Muscular Endurance & Stamina Circuit';
    }
    // Fetch all exercises from DB
    const allExercises = await Exercise_1.ExerciseModel.find({});
    // Filter exercises by equipment and injury exclusion
    const eligible = allExercises.filter(ex => {
        // Check equipment: every item in ex.equipment must be available to user
        const hasEquipment = ex.equipment.every(eq => {
            const eqLower = eq.toLowerCase();
            if (eqLower === 'bodyweight')
                return true;
            return userEquipment.some(ue => ue.includes(eqLower) || eqLower.includes(ue));
        });
        if (!hasEquipment)
            return false;
        // Check injury exclusions (both standard presets and custom free-form limitations)
        for (const inj of userInjuries) {
            const injStr = inj.toLowerCase().trim();
            if (!injStr || injStr === 'none')
                continue;
            // 1. Knee / Patellar
            if (injStr.includes('knee') || injStr.includes('patellar')) {
                if (ex.substitutionTags.includes('knee_flexion') || ex.name.toLowerCase().includes('lunge') || ex.name.toLowerCase().includes('jump')) {
                    return false;
                }
            }
            // 2. Lower Back / Spine / Disc
            if (injStr.includes('lower_back') || injStr.includes('back') || injStr.includes('disc') || injStr.includes('spine')) {
                if (ex.name.toLowerCase().includes('deadlift') || ex.substitutionTags.includes('barbell_back') || ex.name.toLowerCase().includes('good morning')) {
                    return false;
                }
            }
            // 3. Shoulders / Rotator Cuff
            if (injStr.includes('shoulder') || injStr.includes('rotator')) {
                if (ex.substitutionTags.includes('vertical_press') || ex.name.toLowerCase().includes('overhead') || ex.name.toLowerCase().includes('upright row')) {
                    return false;
                }
            }
            // 4. Wrists / Carpal Tunnel
            if (injStr.includes('wrist') || injStr.includes('carpal')) {
                if (ex.name.toLowerCase().includes('pushup') || ex.name.toLowerCase().includes('clean') || ex.name.toLowerCase().includes('wrist curl')) {
                    return false;
                }
            }
            // 5. Neck
            if (injStr.includes('neck')) {
                if (ex.name.toLowerCase().includes('behind') || ex.name.toLowerCase().includes('shrug')) {
                    return false;
                }
            }
            // 6. Elbow / Forearm / Tendonitis
            if (injStr.includes('elbow') || injStr.includes('forearm') || injStr.includes('tendonitis')) {
                if (ex.name.toLowerCase().includes('skull crusher') || ex.name.toLowerCase().includes('french press') || ex.name.toLowerCase().includes('dip')) {
                    return false;
                }
            }
            // 7. Hip
            if (injStr.includes('hip')) {
                if (ex.name.toLowerCase().includes('sumo') || ex.name.toLowerCase().includes('hip thrust') || ex.name.toLowerCase().includes('wide squat')) {
                    return false;
                }
            }
            // 8. Ankle / Achilles
            if (injStr.includes('ankle') || injStr.includes('achilles')) {
                if (ex.name.toLowerCase().includes('calf jump') || ex.name.toLowerCase().includes('plyo') || ex.name.toLowerCase().includes('box jump')) {
                    return false;
                }
            }
            // 9. Generic custom keyword matching against exercise name or muscle groups
            const exNameLower = ex.name.toLowerCase();
            const exMusclesLower = (ex.muscleGroups || []).map(m => m.toLowerCase());
            const words = injStr.split(/\s+/).filter(w => w.length > 3 && !['pain', 'hurt', 'injury', 'left', 'right', 'strain', 'sprain'].includes(w));
            for (const word of words) {
                if (exNameLower.includes(word) || exMusclesLower.includes(word)) {
                    return false;
                }
            }
        }
        // Filter difficulty for beginners
        if (level === 'beginner' && ex.difficulty === 'advanced') {
            return false;
        }
        return true;
    });
    // Balanced routine selection: Ensure a balanced spread across push, pull, legs, core
    const selected = [];
    const muscleCategories = ['Chest', 'Back', 'Quads', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Glutes', 'Hamstrings'];
    // Shuffle muscle categories for variety
    const shuffledCategories = [...muscleCategories].sort(() => 0.5 - Math.random());
    for (const cat of shuffledCategories) {
        if (selected.length >= exerciseCount)
            break;
        const candidates = eligible.filter(e => e.muscleGroups.some(m => m.toLowerCase() === cat.toLowerCase()) &&
            !selected.some(s => s._id.toString() === e._id.toString()));
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
    const exercises = selected.map(ex => ({
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
        durationMinutes: sessionLength,
        title,
        goal
    };
};
exports.generateWorkoutRoutine = generateWorkoutRoutine;
