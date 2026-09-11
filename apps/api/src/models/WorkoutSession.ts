import mongoose from 'mongoose';

const ExerciseItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  sets: { type: Number, required: true, default: 1 },
  reps: { type: Number, required: true, default: 10 },
  weight: { type: Number, required: true, default: 0 }
});

const WorkoutSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true, default: () => new Date().toISOString() },
  durationMinutes: { type: Number, required: true, default: 30 },
  exercises: [ExerciseItemSchema]
}, { timestamps: true });

export const WorkoutSessionModel = mongoose.model('WorkoutSession', WorkoutSessionSchema);
