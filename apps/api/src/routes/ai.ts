import { Router, Request, Response } from 'express';
import { optionalAuth } from '../middleware/auth';
import { YuriAiSessionModel } from '../models/YuriAiSession';
import { UserModel } from '../models/User';
import { processYuriAiMessage, substituteExercise, shortenWorkout } from '../services/yuriAi';

const router = Router();

// GET /api/ai/session/:activeWorkoutId - Fetch chat history for workout
router.get('/session/:activeWorkoutId', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest';
    const { activeWorkoutId } = req.params;

    const session = await YuriAiSessionModel.findOne({ userId, activeWorkoutId });
    res.json(session ? session.messages : []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/chat - Process message and mutate workout
router.post('/chat', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest';
    const { activeWorkoutId, message } = req.body;

    if (!activeWorkoutId || !message) {
      res.status(400).json({ error: 'activeWorkoutId and message are required' });
      return;
    }

    // Check tier limits: Free users are capped on AI swaps
    if (userId && userId !== 'guest' && require('mongoose').Types.ObjectId.isValid(userId)) {
      const user = await UserModel.findById(userId);
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

    const result = await processYuriAiMessage({
      userId,
      activeWorkoutId,
      userMessage: message
    });

    res.json(result);
  } catch (err: any) {
    console.error('[Yuri AI] Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
