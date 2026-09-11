import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  password: { type: String }, // Hashed with bcrypt, optional for Google-only users
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  googleId: { type: String },
  avatar: { type: String },
  height: { type: Number },
  weight: { type: Number },
  subscriptionStatus: { type: String, default: 'inactive' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);
