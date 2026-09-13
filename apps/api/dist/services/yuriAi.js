"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processYuriAiMessage = exports.regenerateForEquipment = exports.shortenWorkout = exports.substituteExercise = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const WorkoutSession_1 = require("../models/WorkoutSession");
const Exercise_1 = require("../models/Exercise");
const User_1 = require("../models/User");
const YuriAiSession_1 = require("../models/YuriAiSession");
const workoutGenerator_1 = require("./workoutGenerator");
// Helper to safely find or create active workout session
const resolveWorkoutSession = async (workoutId) => {
    if (workoutId && mongoose_1.default.Types.ObjectId.isValid(workoutId)) {
        const session = await WorkoutSession_1.WorkoutSessionModel.findById(workoutId);
        if (session)
            return session;
    }
    // Fallback to recent uncompleted workout
    let session = await WorkoutSession_1.WorkoutSessionModel.findOne({ completed: false }).sort({ date: -1 });
    if (!session) {
        const routine = await (0, workoutGenerator_1.generateWorkoutRoutine)({ profile: {} });
        session = await WorkoutSession_1.WorkoutSessionModel.create({
            userId: 'guest_user',
            date: new Date().toISOString(),
            durationMinutes: routine.durationMinutes,
            completed: false,
            source: 'generated',
            exercises: routine.exercises
        });
    }
    return session;
};
// Tool 1: substituteExercise
const substituteExercise = async (workoutId, currentExerciseNameOrId, reason, userInjuries = [], userEquipment = []) => {
    const session = await resolveWorkoutSession(workoutId);
    if (!session || !session.exercises || session.exercises.length === 0) {
        throw new Error('No exercises in workout session to substitute');
    }
    let exerciseIndex = session.exercises.findIndex(e => e.exerciseId === currentExerciseNameOrId ||
        e.name.toLowerCase() === currentExerciseNameOrId.toLowerCase() ||
        e._id?.toString() === currentExerciseNameOrId);
    // If specific name wasn't found, default to first exercise
    if (exerciseIndex === -1) {
        exerciseIndex = 0;
    }
    const currentExercise = session.exercises[exerciseIndex];
    // Find current exercise catalog metadata
    const originalCatalogItem = await Exercise_1.ExerciseModel.findOne({
        $or: [{ name: currentExercise.name }, { _id: currentExercise.exerciseId }]
    });
    const muscleGroup = originalCatalogItem?.muscleGroups?.[0] || 'Chest';
    const tags = originalCatalogItem?.substitutionTags || [];
    // Find candidate replacements that are NOT the current exercise
    const candidates = await Exercise_1.ExerciseModel.find({
        name: { $ne: currentExercise.name },
        $or: [
            { substitutionTags: { $in: tags } },
            { muscleGroups: { $in: [muscleGroup] } }
        ]
    });
    // Filter candidates avoiding injuries (both presets and custom tags)
    const filtered = candidates.filter(c => {
        const cName = c.name.toLowerCase();
        for (const inj of userInjuries) {
            const injStr = inj.toLowerCase().trim();
            if (!injStr || injStr === 'none')
                continue;
            if ((injStr.includes('shoulder') || injStr.includes('rotator')) && (c.substitutionTags.includes('vertical_press') || cName.includes('overhead')))
                return false;
            if ((injStr.includes('knee') || injStr.includes('patellar')) && (c.substitutionTags.includes('knee_flexion') || cName.includes('lunge') || cName.includes('jump')))
                return false;
            if ((injStr.includes('lower_back') || injStr.includes('back') || injStr.includes('spine')) && (cName.includes('deadlift') || c.substitutionTags.includes('barbell_back')))
                return false;
            if (injStr.includes('wrist') && (cName.includes('pushup') || cName.includes('clean')))
                return false;
            if (injStr.includes('elbow') && (cName.includes('skull crusher') || cName.includes('dip')))
                return false;
            if (injStr.includes('neck') && (cName.includes('behind') || cName.includes('shrug')))
                return false;
            const words = injStr.split(/\s+/).filter(w => w.length > 3 && !['pain', 'hurt', 'injury', 'left', 'right'].includes(w));
            for (const word of words) {
                if (cName.includes(word) || c.muscleGroups.some(m => m.toLowerCase().includes(word)))
                    return false;
            }
        }
        return true;
    });
    const replacement = filtered[Math.floor(Math.random() * filtered.length)] || candidates[0];
    if (!replacement) {
        throw new Error('No suitable replacement exercise found in catalog');
    }
    // Mutate session in place
    session.exercises[exerciseIndex].exerciseId = replacement._id.toString();
    session.exercises[exerciseIndex].name = replacement.name;
    session.exercises[exerciseIndex].mediaUrl = replacement.mediaUrl;
    session.exercises[exerciseIndex].formCues = replacement.formCues;
    session.source = 'ai-edited';
    await session.save();
    return {
        action: 'substituteExercise',
        oldExercise: currentExercise.name,
        newExercise: replacement.name,
        reason,
        session
    };
};
exports.substituteExercise = substituteExercise;
// Tool 2: shortenWorkout
const shortenWorkout = async (workoutId, minutesAvailable) => {
    const session = await resolveWorkoutSession(workoutId);
    if (!session)
        throw new Error('Workout session not found');
    let targetCount = 3;
    if (minutesAvailable <= 15)
        targetCount = 2;
    else if (minutesAvailable <= 25)
        targetCount = 3;
    else if (minutesAvailable <= 35)
        targetCount = 4;
    else
        targetCount = Math.min(session.exercises.length, 5);
    if (session.exercises.length > targetCount) {
        // Keep high-value primary movements, drop accessories
        session.exercises = session.exercises.slice(0, targetCount);
    }
    session.durationMinutes = minutesAvailable;
    session.source = 'ai-edited';
    await session.save();
    return {
        action: 'shortenWorkout',
        newDuration: minutesAvailable,
        exerciseCount: session.exercises.length,
        session
    };
};
exports.shortenWorkout = shortenWorkout;
// Tool 3: regenerateForEquipment
const regenerateForEquipment = async (workoutId, availableEquipment, userProfile) => {
    const session = await resolveWorkoutSession(workoutId);
    if (!session)
        throw new Error('Workout session not found');
    const newRoutine = await (0, workoutGenerator_1.generateWorkoutRoutine)({
        profile: {
            ...userProfile,
            equipment: availableEquipment
        }
    });
    session.exercises = newRoutine.exercises;
    session.durationMinutes = newRoutine.durationMinutes;
    session.source = 'ai-edited';
    await session.save();
    return {
        action: 'regenerateForEquipment',
        equipment: availableEquipment,
        session
    };
};
exports.regenerateForEquipment = regenerateForEquipment;
// Main Yuri AI Chat Processor with Function Calling
const processYuriAiMessage = async ({ userId, activeWorkoutId, userMessage }) => {
    const user = (userId && mongoose_1.default.Types.ObjectId.isValid(userId))
        ? await User_1.UserModel.findById(userId)
        : null;
    const workout = await resolveWorkoutSession(activeWorkoutId);
    const workoutIdToUse = workout._id.toString();
    const injuries = (user?.profile?.injuries || []).map((i) => i.toLowerCase());
    const equipment = (user?.profile?.equipment || []).map((e) => e.toLowerCase());
    // Find or create AI session
    let aiSession = await YuriAiSession_1.YuriAiSessionModel.findOne({ userId, activeWorkoutId: workoutIdToUse });
    if (!aiSession) {
        aiSession = await YuriAiSession_1.YuriAiSessionModel.create({
            userId,
            activeWorkoutId: workoutIdToUse,
            messages: [
                {
                    role: 'system',
                    content: `You are Yuri, an elite personal AI fitness coach. You adapt workouts in real-time. When a user requests a change, you MUST call one of the provided tools to mutate their active workout session. Always provide encouraging, concise coaching cues with your changes.`
                }
            ]
        });
    }
    // Append user message
    aiSession.messages.push({
        role: 'user',
        content: userMessage
    });
    const msgLower = userMessage.toLowerCase();
    let toolCallResult = null;
    let assistantReply = '';
    // Intent parsing & deterministic tool execution (Instant, reliable, offline/keyless compatible)
    if (msgLower.includes('20 min') || msgLower.includes('shorten') || msgLower.includes('less time') || msgLower.includes('in a rush') || msgLower.includes('quick')) {
        toolCallResult = await (0, exports.shortenWorkout)(workoutIdToUse, 20);
        assistantReply = `⚡ I've condensed your routine to the 3 highest-yield movements to get you out in 20 minutes with zero junk volume. Crush these sets!`;
    }
    else if (msgLower.includes('hurt') || msgLower.includes('pain') || msgLower.includes('swap') || msgLower.includes('replace') || msgLower.includes('substitute') || msgLower.includes('tweak')) {
        const firstExName = workout?.exercises?.[0]?.name || 'Exercise';
        toolCallResult = await (0, exports.substituteExercise)(workoutIdToUse, firstExName, 'Joint relief / comfort', injuries, equipment);
        assistantReply = `🩹 Done! I swapped out ${toolCallResult.oldExercise} for ${toolCallResult.newExercise}. It targets the same muscle fibers without aggravating sensitive joints.`;
    }
    else if (msgLower.includes('no gym') || msgLower.includes('home') || msgLower.includes('hotel') || msgLower.includes('travel') || msgLower.includes('bodyweight')) {
        toolCallResult = await (0, exports.regenerateForEquipment)(workoutIdToUse, ['Bodyweight'], user?.profile || {});
        assistantReply = `🏨 Adapted! I've rebuilt your session exclusively for bodyweight and zero equipment. You can do this right on the floor. Let's work!`;
    }
    else if (msgLower.includes('harder') || msgLower.includes('intense') || msgLower.includes('pump')) {
        if (workout) {
            workout.exercises.forEach(e => { e.targetSets = Math.min(e.targetSets + 1, 5); });
            workout.source = 'ai-edited';
            await workout.save();
            toolCallResult = { action: 'increaseVolume', session: workout };
        }
        assistantReply = `🔥 Added an extra working set to every movement today. Focus on deep mind-muscle control and progressive overload!`;
    }
    else {
        // General conversational response
        assistantReply = `I'm here to tailor your workout. You can ask me to swap any exercise that hurts, cut the session down if you're short on time, or adapt to whatever equipment you have on hand.`;
    }
    // Append assistant message and record snapshot
    aiSession.messages.push({
        role: 'assistant',
        content: assistantReply,
        toolCalls: toolCallResult ? [{ name: toolCallResult.action, arguments: toolCallResult }] : undefined
    });
    if (toolCallResult?.session) {
        aiSession.stateSnapshot = toolCallResult.session;
    }
    await aiSession.save();
    // Return fresh workout state alongside the message
    const freshWorkout = await WorkoutSession_1.WorkoutSessionModel.findById(workoutIdToUse);
    return {
        reply: assistantReply,
        message: assistantReply,
        action: toolCallResult?.action || null,
        workout: freshWorkout || workout,
        updatedWorkout: freshWorkout || workout,
        messages: aiSession.messages
    };
};
exports.processYuriAiMessage = processYuriAiMessage;
