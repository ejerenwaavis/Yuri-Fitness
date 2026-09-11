"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const google_auth_library_1 = require("google-auth-library");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const getAdminEmails = () => {
    const envAdmins = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase())
        : [];
    return ['ejerenwaavis@gmail.com', ...envAdmins];
};
const isEmailAdmin = (email) => {
    return getAdminEmails().includes(email.toLowerCase());
};
// Helper to sign JWT
const signUserToken = (user) => {
    return jsonwebtoken_1.default.sign({
        userId: user._id.toString(),
        email: user.email,
        role: user.role || 'user'
    }, process.env.JWT_SECRET || 'super_secret_jwt_key_for_yuri_fitness', { expiresIn: '30d' });
};
// POST /auth/register - Standard email/password registration
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            res.status(400).json({ error: 'Email, password, and name are required' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters long' });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        const existing = await User_1.UserModel.findOne({ email: normalizedEmail });
        if (existing) {
            res.status(409).json({ error: 'An account with this email already exists' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const role = isEmailAdmin(normalizedEmail) ? 'admin' : 'user';
        const user = await User_1.UserModel.create({
            email: normalizedEmail,
            name: name.trim(),
            password: hashedPassword,
            role,
            subscriptionStatus: 'inactive'
        });
        const token = signUserToken(user);
        res.status(201).json({
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                height: user.height,
                weight: user.weight,
                subscriptionStatus: user.subscriptionStatus
            }
        });
    }
    catch (error) {
        console.error('[Auth] Register error:', error);
        res.status(500).json({ error: error?.message || 'Registration failed' });
    }
});
// POST /auth/login - Standard email/password login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User_1.UserModel.findOne({ email: normalizedEmail });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        if (!user.password) {
            res.status(400).json({
                error: 'This account was registered with Google. Please use Continue with Google.'
            });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        // Auto-promote to admin if email matches admin list
        if (isEmailAdmin(user.email) && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }
        const token = signUserToken(user);
        res.json({
            token,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                height: user.height,
                weight: user.weight,
                subscriptionStatus: user.subscriptionStatus
            }
        });
    }
    catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({ error: error?.message || 'Login failed' });
    }
});
// POST /auth/google - Google OAuth One-Tap & Sign-In
router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({ error: 'Token is required' });
            return;
        }
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            res.status(400).json({ error: 'Invalid Google token' });
            return;
        }
        const { sub: googleId, email, name, picture: avatar } = payload;
        const normalizedEmail = email.toLowerCase().trim();
        let user = await User_1.UserModel.findOne({ email: normalizedEmail });
        const targetRole = isEmailAdmin(normalizedEmail) ? 'admin' : 'user';
        if (!user) {
            user = await User_1.UserModel.create({
                email: normalizedEmail,
                name: name || 'User',
                googleId,
                avatar,
                role: targetRole,
                subscriptionStatus: 'inactive',
            });
        }
        else {
            let needsSave = false;
            if (!user.googleId) {
                user.googleId = googleId;
                needsSave = true;
            }
            if (avatar && user.avatar !== avatar) {
                user.avatar = avatar;
                needsSave = true;
            }
            if (isEmailAdmin(normalizedEmail) && user.role !== 'admin') {
                user.role = 'admin';
                needsSave = true;
            }
            if (needsSave) {
                await user.save();
            }
        }
        const appToken = signUserToken(user);
        res.json({
            token: appToken,
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                height: user.height,
                weight: user.weight,
                subscriptionStatus: user.subscriptionStatus,
            }
        });
    }
    catch (error) {
        console.error('[Auth] Google Auth Error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});
// GET /auth/me - Get current user profile
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const user = await User_1.UserModel.findById(req.user.id);
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
            height: user.height,
            weight: user.weight,
            subscriptionStatus: user.subscriptionStatus
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
exports.default = router;
