import { Router, Request, Response } from 'express';
import { UserModel } from '../models/User';
import { optionalAuth, authenticateToken } from '../middleware/auth';

const router = Router();

// Helper to get authenticated user ID
const getUserId = (req: Request): string | null => {
  return req.user?.id || null;
};

// GET /api/users/profile - Get current user's profile and subscription
router.get('/profile', optionalAuth, async (req: Request, res: Response): Promise<void> => {
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

    const user = await UserModel.findById(userId);
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
  } catch (err: any) {
    console.error('[Users] Get profile error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/profile - Update user profile (onboarding, goals, stats)
router.put('/profile', optionalAuth, async (req: Request, res: Response): Promise<void> => {
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

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (name) user.name = name.trim();
    if (avatar) user.avatar = avatar;
    if (profile) {
      const existingProfile = user.profile ? (user.toObject().profile || {}) : {};
      user.profile = {
        ...existingProfile,
        ...profile
      } as any;
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
  } catch (err: any) {
    console.error('[Users] Update profile error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
