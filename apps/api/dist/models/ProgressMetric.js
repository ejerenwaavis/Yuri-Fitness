"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressMetricModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ProgressMetricSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true, default: () => new Date().toISOString(), index: true },
    weight: { type: Number }, // kg or lbs
    measurements: {
        type: Map,
        of: Number,
        default: {}
    }, // neck, shoulders, chest, biceps, waist, hips, legs
    photoUrls: [{ type: String }], // Cloudinary/S3 URLs [front, side, back]
}, { timestamps: true });
exports.ProgressMetricModel = mongoose_1.default.model('ProgressMetric', ProgressMetricSchema);
