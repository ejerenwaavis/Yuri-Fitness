"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutSessionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ExerciseItemSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true, trim: true },
    sets: { type: Number, required: true, default: 1 },
    reps: { type: Number, required: true, default: 10 },
    weight: { type: Number, required: true, default: 0 }
});
const WorkoutSessionSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, default: () => new Date().toISOString() },
    durationMinutes: { type: Number, required: true, default: 30 },
    exercises: [ExerciseItemSchema]
}, { timestamps: true });
exports.WorkoutSessionModel = mongoose_1.default.model('WorkoutSession', WorkoutSessionSchema);
