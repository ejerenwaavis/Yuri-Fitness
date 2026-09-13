import mongoose from 'mongoose';

const LoggedSetSchema = new mongoose.Schema({
  reps: { type: Number, required: true },
  weight: { type: Number, required: true },
  completed: { type: Boolean, default: true }
}, { _id: false });

const SessionExerciseSchema = new mongoose.Schema({
  exerciseId: { type: String },
  name: { type: String, required: true, trim: true },
  targetSets: { type: Number, required: true, default: 3 },
  targetReps: { type: Number, required: true, default: 10 },
  targetWeight: { type: Number, required: true, default: 0 },
  loggedSets: [LoggedSetSchema],
  rpe: { type: String }, // e.g. '😫' | '😐' | '🙂' | '💪' | '🔥'
  mediaUrl: { type: String },
  formCues: [{ type: String }]
}, { _id: true });

const WorkoutSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, default: () => new Date().toISOString() },
  durationMinutes: { type: Number, required: true, default: 45 },
  completed: { type: Boolean, default: false, index: true },
  source: { 
    type: String, 
    enum: ['generated', 'ai-edited', 'manual'], 
    default: 'generated' 
  },
  title: { type: String },
  goal: { type: String, enum: ['hypertrophy', 'strength', 'fat_loss', 'endurance'], default: 'hypertrophy' },
  exercises: [SessionExerciseSchema],
  rpe: { type: String } // Overall session RPE emoji
}, { timestamps: true });

export const WorkoutSessionModel = mongoose.model('WorkoutSession', WorkoutSessionSchema);
