import mongoose from 'mongoose';

const BodyMeasurementSchema = new mongoose.Schema({
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

export const BodyMeasurementModel = mongoose.model('BodyMeasurement', BodyMeasurementSchema);
