"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Mock data
const mockUser = {
    id: 'u1',
    email: 'test@example.com',
    name: 'Test User',
    subscriptionStatus: 'inactive'
};
const mockWorkouts = [
    {
        id: 'w1',
        userId: 'u1',
        date: new Date().toISOString(),
        durationMinutes: 45,
        exercises: [
            { id: 'e1', name: 'Bench Press', sets: 3, reps: 10, weight: 135 }
        ]
    }
];
const mockMeasurements = [];
router.get('/user', (req, res) => {
    res.json(mockUser);
});
router.get('/workouts', (req, res) => {
    res.json(mockWorkouts);
});
router.post('/workouts', (req, res) => {
    const newWorkout = { ...req.body, id: Date.now().toString() };
    mockWorkouts.push(newWorkout);
    res.json(newWorkout);
});
router.get('/measurements', (req, res) => {
    res.json(mockMeasurements);
});
router.post('/measurements', (req, res) => {
    const newMeasurement = { ...req.body, id: Date.now().toString() };
    mockMeasurements.push(newMeasurement);
    res.json(newMeasurement);
});
exports.default = router;
