"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Helper to get authenticated user ID
const getUserId = (req) => {
    return req.user?.id || null;
};
// GET /api/users/profile - Get current user's profile and subscription
router.get('/profile', auth_1.optionalAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            // Return guest template
            res.json({
                id: 'guest',
                email: 'guest@yurifitness.com',
                name: 'Guest User',
                role: 'user',
                subscriptionStatus: 'free',
                profile: {
                    goal: 'hypertrophy',
                    level: 'beginner',
                    daysAvailable: 3,
                    sessionLength: 45,
                    equipment: ['dumbbell', 'bodyweight'],
                    injuries: [],
                    onboardingCompleted: false
                }
            });
            return;
        }
        const user = await User_1.UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            subscriptionStatus: user.subscriptionStatus || 'free',
            profile: user.profile || { onboardingCompleted: false }
        });
    }
    catch (err) {
        console.error('[Users] Get profile error:', err);
        res.status(500).json({ error: err.message });
    }
});
// PUT /api/users/profile - Update user profile (onboarding, goals, stats)
router.put('/profile', auth_1.optionalAuth, async (req, res) => {
    try {
        const userId = getUserId(req);
        const { profile, name, avatar } = req.body;
        if (!userId) {
            // In guest mode, echo back updated profile
            res.json({
                id: 'guest',
                name: name || 'Guest User',
                role: 'user',
                subscriptionStatus: 'free',
                profile: {
                    ...(profile || {}),
                    onboardingCompleted: true
                }
            });
            return;
        }
        const user = await User_1.UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (name)
            user.name = name.trim();
        if (avatar)
            user.avatar = avatar;
        if (profile) {
            const existingProfile = user.profile ? (user.toObject().profile || {}) : {};
            user.profile = {
                ...existingProfile,
                ...profile
            };
        }
        await user.save();
        res.json({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            subscriptionStatus: user.subscriptionStatus,
            profile: user.profile
        });
    }
    catch (err) {
        console.error('[Users] Update profile error:', err);
        res.status(500).json({ error: err.message });
    }
});
// POST /api/users/change-password - Change current user's password
router.post('/change-password', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;
        if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
            res.status(400).json({ error: 'New password must be at least 6 characters long' });
            return;
        }
        const user = await User_1.UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // If user already has a password, verify currentPassword
        if (user.password) {
            if (!currentPassword) {
                res.status(400).json({ error: 'Current password is required' });
                return;
            }
            const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isMatch) {
                res.status(400).json({ error: 'Current password is incorrect' });
                return;
            }
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.json({ success: true, message: 'Password updated successfully' });
    }
    catch (err) {
        console.error('[Users] Change password error:', err);
        res.status(500).json({ error: err.message || 'Failed to update password' });
    }
});
exports.default = router;
