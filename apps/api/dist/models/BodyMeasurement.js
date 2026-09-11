"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyMeasurementModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const BodyMeasurementSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, default: () => new Date().toISOString() },
    height: { type: Number },
    weight: { type: Number },
    neck: { type: Number },
    shoulders: { type: Number },
    chest: { type: Number },
    biceps: { type: Number },
    waist: { type: Number },
    hips: { type: Number },
    upperLeg: { type: Number },
    lowerLeg: { type: Number },
    unit: { type: String, enum: ['cm', 'in'], default: 'cm' },
    bmi: { type: Number }
}, { timestamps: true });
exports.BodyMeasurementModel = mongoose_1.default.model('BodyMeasurement', BodyMeasurementSchema);
