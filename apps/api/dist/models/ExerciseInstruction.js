"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseInstructionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ExerciseInstructionSchema = new mongoose_1.default.Schema({
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
exports.ExerciseInstructionModel = mongoose_1.default.model('ExerciseInstruction', ExerciseInstructionSchema);
