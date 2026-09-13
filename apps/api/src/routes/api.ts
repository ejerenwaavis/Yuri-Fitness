import { Router, Request, Response } from 'express';
import { WorkoutSessionModel } from '../models/WorkoutSession';
import { UserModel } from '../models/User';
import { optionalAuth } from '../middleware/auth';
import { generateWorkoutRoutine } from '../services/workoutGenerator';

const router = Router();

router.use(optionalAuth);

const getUserId = (req: Request): string => {
  return req.user?.id || (req.query.userId as string) || 'guest_user';
};

// GET /api/workouts - User's workout sessions
router.get('/workouts', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const filter: Record<string, any> = {};
    if (userId !== 'guest_user') {
      filter.userId = userId;
    }
    const workouts = await WorkoutSessionModel.find(filter).sort({ date: -1 });
    res.json(workouts);
  } catch (err: any) {
    console.error('[API] Get workouts error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workouts/today - Today's active or upcoming workout
router.get('/workouts/today', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const filter: Record<string, any> = { completed: false };
    if (userId !== 'guest_user') {
      filter.userId = userId;
    }

    // Check for an active uncompleted session
    let workout = await WorkoutSessionModel.findOne(filter).sort({ date: -1 });

    // Check user profile for goal and equipment
    let profile: any = {};
    if (userId !== 'guest_user') {
      const user = await UserModel.findById(userId);
      profile = user?.profile || {};
    }

    // Check if the current session has any logged sets
    const hasLoggedSets = workout?.exercises?.some((e: any) =>
      e.loggedSets?.some((ls: any) => ls.completed)
    );

    // If no session exists OR user changed their goal and hasn't logged sets yet, generate matching routine
    if (!workout || (!hasLoggedSets && profile.goal && workout.goal && workout.goal !== profile.goal)) {
      if (workout && !hasLoggedSets) {
        await WorkoutSessionModel.findByIdAndDelete(workout._id);
      }

      const generated = await generateWorkoutRoutine({ profile });
      workout = await WorkoutSessionModel.create({
        userId,
        date: new Date().toISOString(),
        durationMinutes: generated.durationMinutes,
        completed: false,
        source: 'generated',
        title: generated.title,
        goal: generated.goal,
        exercises: generated.exercises
      });
    }

    res.json(workout);
  } catch (err: any) {
    console.error('[API] Get today workout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/workouts/:id - Single workout details
router.get('/workouts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const workout = await WorkoutSessionModel.findById(req.params.id);
    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }
    res.json(workout);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workouts/generate - Explicitly generate a fresh workout from profile
router.post('/workouts/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);

    // Enforce Free tier cap: 3 workouts / week
    if (userId !== 'guest_user') {
      const user = await UserModel.findById(userId);
      if (user && user.subscriptionStatus === 'free') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const completedThisWeek = await WorkoutSessionModel.countDocuments({
          userId,
          completed: true,
          date: { $gte: sevenDaysAgo.toISOString() }
        });

        if (completedThisWeek >= 3) {
          res.status(403).json({
            error: 'PAYWALL_TRIGGER',
            message: "You've reached your 3 free workouts for this week! Upgrade to Yuri Pro for unlimited routines and live AI coaching."
          });
          return;
        }
      }
    }

    let profile = req.body.profile;
    if (!profile && userId !== 'guest_user') {
      const user = await UserModel.findById(userId);
      profile = user?.profile;
    }

    const routine = await generateWorkoutRoutine({ profile: profile || {} });

    // If an uncompleted workout exists with zero logged sets, replace it
    if (userId !== 'guest_user') {
      const existingUnstarted = await WorkoutSessionModel.findOne({ userId, completed: false }).sort({ date: -1 });
      const hasLogged = existingUnstarted?.exercises?.some((e: any) => e.loggedSets?.some((ls: any) => ls.completed));
      if (existingUnstarted && !hasLogged) {
        await WorkoutSessionModel.findByIdAndDelete(existingUnstarted._id);
      }
    }

    const newSession = await WorkoutSessionModel.create({
      userId,
      date: new Date().toISOString(),
      durationMinutes: routine.durationMinutes,
      completed: false,
      source: 'generated',
      title: routine.title,
      goal: routine.goal,
      exercises: routine.exercises
    });

    res.status(201).json(newSession);
  } catch (err: any) {
    console.error('[API] Generate workout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/workouts/:id - Update workout session in real-time (logged sets, exercise changes)
router.put('/workouts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await WorkoutSessionModel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workouts/:id/complete - Finish workout with RPE
router.post('/workouts/:id/complete', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rpe, durationMinutes, exercises } = req.body;

    const workout = await WorkoutSessionModel.findById(req.params.id);
    if (!workout) {
      res.status(404).json({ error: 'Workout not found' });
      return;
    }

    workout.completed = true;
    if (rpe) workout.rpe = rpe;
    if (durationMinutes) workout.durationMinutes = durationMinutes;
    if (exercises && Array.isArray(exercises)) workout.exercises = exercises as any;

    await workout.save();
    res.json(workout);
  } catch (err: any) {
    console.error('[API] Complete workout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/workouts - Manual workout creation
router.post('/workouts', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const { date, durationMinutes, exercises, completed = false, rpe } = req.body;

    const newWorkout = await WorkoutSessionModel.create({
      userId,
      date: date || new Date().toISOString(),
      durationMinutes: Number(durationMinutes) || 30,
      completed,
      source: 'manual',
      rpe,
      exercises: exercises || []
    });

    res.status(201).json(newWorkout);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/workouts/:id - Delete workout session
router.delete('/workouts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await WorkoutSessionModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/stats/weekly - Independent Weekly Rings & Metrics
router.get('/stats/weekly', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    const filter: Record<string, any> = {};
    if (userId !== 'guest_user') {
      filter.userId = userId;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    filter.date = { $gte: sevenDaysAgo.toISOString() };

    const recentWorkouts = await WorkoutSessionModel.find(filter);

    let totalMinutes = 0;
    let totalExercises = 0;
    let totalSets = 0;
    let maxWeight = 0;

    recentWorkouts.forEach((w) => {
      totalMinutes += w.durationMinutes || 0;
      if (Array.isArray(w.exercises)) {
        totalExercises += w.exercises.length;
        w.exercises.forEach((ex) => {
          totalSets += ex.targetSets || 0;
          if (ex.targetWeight && ex.targetWeight > maxWeight) {
            maxWeight = ex.targetWeight;
          }
          if (Array.isArray(ex.loggedSets)) {
            ex.loggedSets.forEach(ls => {
              if (ls.weight && ls.weight > maxWeight) maxWeight = ls.weight;
            });
          }
        });
      }
    });

    const goals = {
      minutes: 150,
      exercises: 12,
      sets: 36,
      maxWeight: 100
    };

    const percentages = {
      minutes: Math.min(100, Math.round((totalMinutes / goals.minutes) * 100)),
      exercises: Math.min(100, Math.round((totalExercises / goals.exercises) * 100)),
      sets: Math.min(100, Math.round((totalSets / goals.sets) * 100)),
      maxWeight: Math.min(100, Math.round((maxWeight / goals.maxWeight) * 100))
    };

    res.json({
      metrics: {
        minutes: totalMinutes,
        exercises: totalExercises,
        sets: totalSets,
        maxWeight
      },
      goals,
      percentages,
      sessionCount: recentWorkouts.length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
