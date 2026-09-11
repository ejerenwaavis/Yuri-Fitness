"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.optionalAuth = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    if (!token) {
        res.status(401).json({ error: 'Unauthorized: Authentication token required' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_yuri_fitness');
        const userId = decoded.userId || decoded.id;
        // Fetch user from DB to ensure freshest role and validity
        const dbUser = await User_1.UserModel.findById(userId);
        if (!dbUser) {
            res.status(401).json({ error: 'Unauthorized: User not found' });
            return;
        }
        req.user = {
            id: dbUser._id.toString(),
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role || 'user'
        };
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : null;
    if (!token) {
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_yuri_fitness');
        const userId = decoded.userId || decoded.id;
        const dbUser = await User_1.UserModel.findById(userId);
        if (dbUser) {
            req.user = {
                id: dbUser._id.toString(),
                email: dbUser.email,
                name: dbUser.name,
                role: dbUser.role || 'user'
            };
        }
    }
    catch {
        // Ignore invalid token in optionalAuth
    }
    next();
};
exports.optionalAuth = optionalAuth;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Unauthorized: Authentication required' });
        return;
    }
    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden: Admin access required to perform this action' });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
