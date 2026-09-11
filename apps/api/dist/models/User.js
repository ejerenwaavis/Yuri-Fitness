"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
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
exports.UserModel = mongoose_1.default.model('User', UserSchema);
