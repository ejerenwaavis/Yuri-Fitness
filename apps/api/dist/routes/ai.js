"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const YuriAiSession_1 = require("../models/YuriAiSession");
const User_1 = require("../models/User");
const yuriAi_1 = require("../services/yuriAi");
const router = (0, express_1.Router)();
// GET /api/ai/session/:activeWorkoutId - Fetch chat history for workout
router.get('/session/:activeWorkoutId', auth_1.optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id || 'guest';
        const { activeWorkoutId } = req.params;
        const session = await YuriAiSession_1.YuriAiSessionModel.findOne({ userId, activeWorkoutId });
        res.json(session ? session.messages : []);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/ai/chat - Process message and mutate workout
router.post('/chat', auth_1.optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id || 'guest';
        const { activeWorkoutId, message } = req.body;
        if (!activeWorkoutId || !message) {
            res.status(400).json({ error: 'activeWorkoutId and message are required' });
            return;
        }
        // Check tier limits: Free users are capped on AI swaps
        if (userId !== 'guest') {
            const user = await User_1.UserModel.findById(userId);
            if (user && user.subscriptionStatus === 'free') {
                // Free tier paywall check for AI customization
                const isSwapRequest = message.toLowerCase().includes('swap') || message.toLowerCase().includes('hurt') || message.toLowerCase().includes('shorten') || message.toLowerCase().includes('gym');
                if (isSwapRequest) {
                    res.status(403).json({
                        error: 'PAYWALL_TRIGGER',
                        message: 'Yuri AI dynamic workout adjustments are a Pro feature. Upgrade to Pro for unlimited real-time routine adaptations with a 7-day free trial!'
                    });
                    return;
                }
            }
        }
        const result = await (0, yuriAi_1.processYuriAiMessage)({
            userId,
            activeWorkoutId,
            userMessage: message
        });
        res.json(result);
    }
    catch (err) {
        console.error('[Yuri AI] Chat error:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
