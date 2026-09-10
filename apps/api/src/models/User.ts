import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  googleId: { type: String },
  avatar: { type: String },
  subscriptionStatus: { type: String, default: 'inactive' },
  stripeCustomerId: { type: String },
  stripeSubscriptionId: { type: String },
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);
