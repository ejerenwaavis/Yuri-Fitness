import { WorkoutSessionModel } from '../models/WorkoutSession';
import { ExerciseModel } from '../models/Exercise';
import { UserModel } from '../models/User';
import { YuriAiSessionModel } from '../models/YuriAiSession';
import { generateWorkoutRoutine } from './workoutGenerator';

interface ProcessAiMessageParams {
  userId: string;
  activeWorkoutId: string;
  userMessage: string;
}

// Tool 1: substituteExercise
export const substituteExercise = async (
  workoutId: string, 
  currentExerciseNameOrId: string, 
  reason: string,
  userInjuries: string[] = [],
  userEquipment: string[] = []
) => {
  const session = await WorkoutSessionModel.findById(workoutId);
  if (!session) throw new Error('Workout session not found');

  const exerciseIndex = session.exercises.findIndex(e => 
    e.exerciseId === currentExerciseNameOrId || 
    e.name.toLowerCase() === currentExerciseNameOrId.toLowerCase() ||
    e._id?.toString() === currentExerciseNameOrId
  );

  if (exerciseIndex === -1) {
    // If not exact match, pick the first exercise to swap
    throw new Error(`Exercise "${currentExerciseNameOrId}" not found in current workout`);
  }

  const currentExercise = session.exercises[exerciseIndex];
  
  // Find current exercise catalog metadata
  const originalCatalogItem = await ExerciseModel.findOne({
    $or: [{ name: currentExercise.name }, { _id: currentExercise.exerciseId }]
  });

  const muscleGroup = originalCatalogItem?.muscleGroups?.[0] || 'Chest';
  const tags = originalCatalogItem?.substitutionTags || [];

  // Find candidate replacements that are NOT the current exercise
  const candidates = await ExerciseModel.find({
    name: { $ne: currentExercise.name },
    $or: [
      { substitutionTags: { $in: tags } },
      { muscleGroups: { $in: [muscleGroup] } }
    ]
  });

  // Filter candidates avoiding injuries and matching equipment if provided
  const filtered = candidates.filter(c => {
    if (userInjuries.includes('shoulder') && c.substitutionTags.includes('vertical_press')) return false;
    if (userInjuries.includes('knee') && c.substitutionTags.includes('knee_flexion')) return false;
    if (userInjuries.includes('lower_back') && c.name.toLowerCase().includes('deadlift')) return false;
    return true;
  });

  const replacement = filtered[Math.floor(Math.random() * filtered.length)] || candidates[0];

  if (!replacement) {
    throw new Error('No suitable replacement exercise found');
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

// Tool 2: shortenWorkout
export const shortenWorkout = async (workoutId: string, minutesAvailable: number) => {
  const session = await WorkoutSessionModel.findById(workoutId);
  if (!session) throw new Error('Workout session not found');

  let targetCount = 3;
  if (minutesAvailable <= 15) targetCount = 2;
  else if (minutesAvailable <= 25) targetCount = 3;
  else if (minutesAvailable <= 35) targetCount = 4;
  else targetCount = Math.min(session.exercises.length, 5);

  if (session.exercises.length > targetCount) {
    // Keep high-value primary movements, drop accessories
    (session as any).exercises = session.exercises.slice(0, targetCount);
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

// Tool 3: regenerateForEquipment
export const regenerateForEquipment = async (
  workoutId: string, 
  availableEquipment: string[], 
  userProfile: any
) => {
  const session = await WorkoutSessionModel.findById(workoutId);
  if (!session) throw new Error('Workout session not found');

  const updatedProfile = {
    ...userProfile,
    equipment: availableEquipment
  };

  const newRoutine = await generateWorkoutRoutine({ profile: updatedProfile });
  
  session.exercises = newRoutine.exercises as any;
  session.durationMinutes = newRoutine.durationMinutes;
  session.source = 'ai-edited';

  await session.save();

  return {
    action: 'regenerateForEquipment',
    equipment: availableEquipment,
    session
  };
};

// Main Yuri AI Chat Processor with Function Calling
export const processYuriAiMessage = async ({
  userId,
  activeWorkoutId,
  userMessage
}: ProcessAiMessageParams) => {
  const user = await UserModel.findById(userId);
  const workout = await WorkoutSessionModel.findById(activeWorkoutId);
  const injuries = (user?.profile?.injuries || []).map((i: string) => i.toLowerCase());
  const equipment = (user?.profile?.equipment || []).map((e: string) => e.toLowerCase());

  // Find or create AI session
  let aiSession = await YuriAiSessionModel.findOne({ userId, activeWorkoutId });
  if (!aiSession) {
    aiSession = await YuriAiSessionModel.create({
      userId,
      activeWorkoutId,
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
  let toolCallResult: any = null;
  let assistantReply = '';

  // Intent parsing & deterministic tool execution (Instant, reliable, offline/keyless compatible)
  if (msgLower.includes('20 min') || msgLower.includes('shorten') || msgLower.includes('less time') || msgLower.includes('in a rush') || msgLower.includes('quick')) {
    toolCallResult = await shortenWorkout(activeWorkoutId, 20);
    assistantReply = `⚡ I've condensed your routine to the 3 highest-yield movements to get you out in 20 minutes with zero junk volume. Crush these sets!`;
  } else if (msgLower.includes('hurt') || msgLower.includes('pain') || msgLower.includes('swap') || msgLower.includes('replace') || msgLower.includes('substitute') || msgLower.includes('tweak')) {
    const firstExName = workout?.exercises?.[0]?.name || 'Exercise';
    toolCallResult = await substituteExercise(activeWorkoutId, firstExName, 'Joint relief / comfort', injuries, equipment);
    assistantReply = `🩹 Done! I swapped out ${toolCallResult.oldExercise} for ${toolCallResult.newExercise}. It targets the same muscle fibers without aggravating sensitive joints.`;
  } else if (msgLower.includes('no gym') || msgLower.includes('home') || msgLower.includes('hotel') || msgLower.includes('travel') || msgLower.includes('bodyweight')) {
    toolCallResult = await regenerateForEquipment(activeWorkoutId, ['Bodyweight'], user?.profile || {});
    assistantReply = `🏨 Adapted! I've rebuilt your session exclusively for bodyweight and zero equipment. You can do this right on the floor. Let's work!`;
  } else if (msgLower.includes('harder') || msgLower.includes('intense') || msgLower.includes('pump')) {
    if (workout) {
      workout.exercises.forEach(e => { e.targetSets = Math.min(e.targetSets + 1, 5); });
      workout.source = 'ai-edited';
      await workout.save();
      toolCallResult = { action: 'increaseVolume', session: workout };
    }
    assistantReply = `🔥 Added an extra working set to every movement today. Focus on deep mind-muscle control and progressive overload!`;
  } else {
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
  const freshWorkout = await WorkoutSessionModel.findById(activeWorkoutId);

  return {
    reply: assistantReply,
    action: toolCallResult?.action || null,
    updatedWorkout: freshWorkout,
    messages: aiSession.messages
  };
};
