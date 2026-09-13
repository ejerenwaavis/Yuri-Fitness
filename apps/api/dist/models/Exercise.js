"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ExerciseSchema = new mongoose_1.default.Schema({
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
exports.ExerciseModel = mongoose_1.default.model('Exercise', ExerciseSchema);
