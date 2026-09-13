import mongoose from 'mongoose';

const ProfileSchema = new mongoose.Schema({
  age: { type: Number },
  sex: { type: String, enum: ['male', 'female', 'other'] },
  height: { type: Number }, // cm
  weight: { type: Number }, // kg
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  goal: { type: String, enum: ['hypertrophy', 'strength', 'fat_loss', 'endurance'], default: 'hypertrophy' },
  daysAvailable: { type: Number, default: 3 },
  sessionLength: { type: Number, default: 45 }, // minutes
  equipment: [{ type: String }],
  injuries: [{ type: String }],
  dietPrefs: [{ type: String }],
  weightUnit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
  onboardingCompleted: { type: Boolean, default: false }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String }, // Hashed with bcrypt, optional for Google-only users
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String },
  avatar: { type: String },
  profile: { type: ProfileSchema, default: () => ({}) },
  subscriptionStatus: { type: String, enum: ['free', 'pro', 'active', 'inactive'], default: 'free' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);
