import mongoose from 'mongoose';

const ExerciseInstructionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Full Body', 'Other'],
    default: 'Chest'
  },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  cloudinaryPublicId: { type: String },
  targetMuscles: [{ type: String }],
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'beginner' 
  }
}, { timestamps: true });

export const ExerciseInstructionModel = mongoose.model('ExerciseInstruction', ExerciseInstructionSchema);
