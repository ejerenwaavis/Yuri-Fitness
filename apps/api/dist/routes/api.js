"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const WorkoutSession_1 = require("../models/WorkoutSession");
const BodyMeasurement_1 = require("../models/BodyMeasurement");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Apply optionalAuth to all routes so req.user is set if Authorization header is present
router.use(auth_1.optionalAuth);
const getUserId = (req) => {
    return req.user?.id || req.query.userId || 'guest_user';
};
// Calculate BMI helper
const computeBMI = (height, weight, unit = 'cm') => {
    if (!height || !weight || height <= 0 || weight <= 0)
        return undefined;
    if (unit === 'in') {
        return parseFloat(((weight / (height * height)) * 703).toFixed(1));
    }
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};
// GET /api/user - Current user profile
router.get('/user', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (userId === 'guest_user') {
            res.json({
                id: 'guest_user',
                email: 'guest@yurifitness.com',
                name: 'Guest User',
                role: 'user',
                subscriptionStatus: 'inactive'
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
            height: user.height,
            weight: user.weight,
            subscriptionStatus: user.subscriptionStatus
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/workouts - User's workout sessions
router.get('/workouts', async (req, res) => {
    try {
        const userId = getUserId(req);
        const filter = {};
        if (userId !== 'guest_user') {
            filter.userId = userId;
        }
        const workouts = await WorkoutSession_1.WorkoutSessionModel.find(filter).sort({ date: -1 });
        res.json(workouts);
    }
    catch (err) {
        console.error('[API] Get workouts error:', err);
        res.status(500).json({ error: err.message });
    }
});
// POST /api/workouts - Log a new workout session
router.post('/workouts', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { date, durationMinutes, exercises } = req.body;
        if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
            res.status(400).json({ error: 'At least one exercise is required' });
            return;
        }
        const newWorkout = await WorkoutSession_1.WorkoutSessionModel.create({
            userId,
            date: date || new Date().toISOString(),
            durationMinutes: Number(durationMinutes) || 30,
            exercises: exercises.map((e) => ({
                name: e.name || 'Exercise',
                sets: Number(e.sets) || 1,
                reps: Number(e.reps) || 10,
                weight: Number(e.weight) || 0
            }))
        });
        res.status(201).json(newWorkout);
    }
    catch (err) {
        console.error('[API] Create workout error:', err);
        res.status(500).json({ error: err.message });
    }
});
// GET /api/measurements - User's body measurement snapshots
router.get('/measurements', async (req, res) => {
    try {
        const userId = getUserId(req);
        const filter = {};
        if (userId !== 'guest_user') {
            filter.userId = userId;
        }
        const measurements = await BodyMeasurement_1.BodyMeasurementModel.find(filter).sort({ date: -1 });
        res.json(measurements);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/measurements/latest - Latest body measurement snapshot
router.get('/measurements/latest', async (req, res) => {
    try {
        const userId = getUserId(req);
        const filter = {};
        if (userId !== 'guest_user') {
            filter.userId = userId;
        }
        const latest = await BodyMeasurement_1.BodyMeasurementModel.findOne(filter).sort({ date: -1 });
        res.json(latest || null);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/measurements - Save body measurement snapshot
router.post('/measurements', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { height, weight, neck, shoulders, chest, biceps, waist, hips, upperLeg, lowerLeg, unit = 'cm', date } = req.body;
        const numHeight = height ? Number(height) : undefined;
        const numWeight = weight ? Number(weight) : undefined;
        const bmi = computeBMI(numHeight, numWeight, unit);
        const snapshot = await BodyMeasurement_1.BodyMeasurementModel.create({
            userId,
            date: date || new Date().toISOString(),
            height: numHeight,
            weight: numWeight,
            neck: neck ? Number(neck) : undefined,
            shoulders: shoulders ? Number(shoulders) : undefined,
            chest: chest ? Number(chest) : undefined,
            biceps: biceps ? Number(biceps) : undefined,
            waist: waist ? Number(waist) : undefined,
            hips: hips ? Number(hips) : undefined,
            upperLeg: upperLeg ? Number(upperLeg) : undefined,
            lowerLeg: lowerLeg ? Number(lowerLeg) : undefined,
            unit,
            bmi
        });
        // Update user record if height or weight provided
        if (userId !== 'guest_user' && (numHeight || numWeight)) {
            const updateData = {};
            if (numHeight)
                updateData.height = numHeight;
            if (numWeight)
                updateData.weight = numWeight;
            await User_1.UserModel.findByIdAndUpdate(userId, updateData);
        }
        res.status(201).json(snapshot);
    }
    catch (err) {
        console.error('[API] Create measurement error:', err);
        res.status(500).json({ error: err.message });
    }
});
// GET /api/stats/weekly - Independent Weekly Rings & Metrics
router.get('/stats/weekly', async (req, res) => {
    try {
        const userId = getUserId(req);
        const filter = {};
        if (userId !== 'guest_user') {
            filter.userId = userId;
        }
        // Workouts in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filter.date = { $gte: sevenDaysAgo.toISOString() };
        const recentWorkouts = await WorkoutSession_1.WorkoutSessionModel.find(filter);
        let totalMinutes = 0;
        let totalExercises = 0;
        let totalSets = 0;
        let maxWeight = 0;
        recentWorkouts.forEach((w) => {
            totalMinutes += w.durationMinutes || 0;
            if (Array.isArray(w.exercises)) {
                totalExercises += w.exercises.length;
                w.exercises.forEach((ex) => {
                    totalSets += ex.sets || 0;
                    if (ex.weight && ex.weight > maxWeight) {
                        maxWeight = ex.weight;
                    }
                });
            }
        });
        // Realistic weekly goals
        const goals = {
            minutes: 150, // 150 min cardio/training goal
            exercises: 12, // 12 distinct exercises
            sets: 36, // 36 total sets
            maxWeight: 100 // 100 kg / lbs benchmark
        };
        // Independent percentage calculations
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
