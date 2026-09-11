"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    googleId: { type: String },
    avatar: { type: String },
    subscriptionStatus: { type: String, default: 'inactive' },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
}, { timestamps: true });
exports.UserModel = mongoose_1.default.model('User', UserSchema);
