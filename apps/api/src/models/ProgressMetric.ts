import mongoose from 'mongoose';

const ProgressMetricSchema = new mongoose.Schema({
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

export const ProgressMetricModel = mongoose.model('ProgressMetric', ProgressMetricSchema);
