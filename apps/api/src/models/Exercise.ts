import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  muscleGroups: [{ type: String, required: true, index: true }], // Primary muscles e.g. ['Chest', 'Triceps']
  secondaryMuscles: [{ type: String }],
  equipment: [{ type: String, required: true, index: true }], // e.g. ['Barbell', 'Bench']
  mediaUrl: { type: String, required: true }, // Video/GIF/Image URL
  formCues: [{ type: String }], // Step-by-step form execution instructions
  substitutionTags: [{ type: String, index: true }], // e.g. ['horizontal_press', 'chest_compound']
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'beginner' 
  }
}, { timestamps: true });

export const ExerciseModel = mongoose.model('Exercise', ExerciseSchema);
