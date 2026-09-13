"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedExerciseDatabase = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const Exercise_1 = require("../models/Exercise");
const auth_1 = require("../middleware/auth");
const exerciseCatalog_1 = require("../seeds/exerciseCatalog");
const router = (0, express_1.Router)();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
// Configure Multer for in-memory upload
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only video or image files are allowed'));
        }
    }
});
// Helper: Stream buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            resource_type: 'auto',
            folder: folder || 'yuri-fitness',
            transformation: [{ quality: 'auto' }]
        }, (error, result) => {
            if (error || !result)
                return reject(error || new Error('Upload to Cloudinary failed'));
            resolve(result);
        });
        stream.end(buffer);
    });
};
// Auto-seed exercises catalog if empty or outdated
const seedExerciseDatabase = async () => {
    try {
        const count = await Exercise_1.ExerciseModel.countDocuments();
        if (count < 50) {
            console.log(`[Exercises] Seeding exercise catalog (${exerciseCatalog_1.EXERCISE_CATALOG.length} items)...`);
            // Use bulk upsert so existing customized exercises aren't lost
            for (const ex of exerciseCatalog_1.EXERCISE_CATALOG) {
                await Exercise_1.ExerciseModel.findOneAndUpdate({ name: ex.name }, { $set: ex }, { upsert: true, new: true });
            }
            console.log('[Exercises] Catalog seeding completed successfully.');
        }
    }
    catch (err) {
        console.warn('[Exercises] Seeding error:', err);
    }
};
exports.seedExerciseDatabase = seedExerciseDatabase;
// Trigger seed check
(0, exports.seedExerciseDatabase)();
// POST /api/exercises/seed - Manual re-seed trigger (Admin only)
router.post('/seed', auth_1.authenticateToken, auth_1.requireAdmin, async (_req, res) => {
    try {
        await (0, exports.seedExerciseDatabase)();
        const count = await Exercise_1.ExerciseModel.countDocuments();
        res.json({ success: true, count });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/exercises/upload - Upload video/media directly to Cloudinary (Admin only)
router.post('/upload', auth_1.authenticateToken, auth_1.requireAdmin, upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No media file provided' });
            return;
        }
        const folder = process.env.CLOUDINARY_FOLDER || 'yuri-fitness';
        const result = await uploadToCloudinary(req.file.buffer, folder);
        const thumbnailUrl = cloudinary_1.v2.url(result.public_id, {
            resource_type: result.resource_type === 'video' ? 'video' : 'image',
            format: 'jpg',
            start_offset: '1.0'
        });
        res.json({
            success: true,
            videoUrl: result.secure_url,
            mediaUrl: result.secure_url,
            publicId: result.public_id,
            thumbnailUrl,
            duration: result.duration,
            format: result.format
        });
    }
    catch (error) {
        console.error('[Exercises] Cloudinary upload error:', error);
        res.status(500).json({ error: error?.message || 'Media upload failed' });
    }
});
// GET /api/exercises - List all catalog exercises (Filterable)
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const { category, muscleGroup, equipment, difficulty, search } = req.query;
        const filter = {};
        const targetMuscle = muscleGroup || (category && category !== 'All' ? category : null);
        if (targetMuscle) {
            filter.muscleGroups = { $regex: new RegExp(`^${targetMuscle}$`, 'i') };
        }
        if (equipment && equipment !== 'All') {
            filter.equipment = { $in: [equipment] };
        }
        if (difficulty && difficulty !== 'All') {
            filter.difficulty = difficulty;
        }
        if (search && typeof search === 'string' && search.trim()) {
            const q = search.trim();
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { muscleGroups: { $regex: q, $options: 'i' } },
                { equipment: { $regex: q, $options: 'i' } },
                { substitutionTags: { $regex: q, $options: 'i' } }
            ];
        }
        const exercises = await Exercise_1.ExerciseModel.find(filter).sort({ name: 1 });
        res.json(exercises);
    }
    catch (error) {
        console.error('[Exercises] Get exercises error:', error);
        res.status(500).json({ error: error?.message || 'Failed to fetch exercises' });
    }
});
// GET /api/exercises/:id - Get a single exercise
router.get('/:id', async (req, res) => {
    try {
        const exercise = await Exercise_1.ExerciseModel.findById(req.params.id);
        if (!exercise) {
            res.status(404).json({ error: 'Exercise not found' });
            return;
        }
        res.json(exercise);
    }
    catch (error) {
        res.status(500).json({ error: error?.message || 'Failed to fetch exercise' });
    }
});
// POST /api/exercises - Create a new exercise (Admin only)
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, muscleGroups, secondaryMuscles, equipment, mediaUrl, formCues, substitutionTags, difficulty } = req.body;
        if (!name || !mediaUrl) {
            res.status(400).json({ error: 'Name and mediaUrl are required' });
            return;
        }
        const newExercise = await Exercise_1.ExerciseModel.create({
            name: name.trim(),
            muscleGroups: Array.isArray(muscleGroups) ? muscleGroups : [muscleGroups || 'Chest'],
            secondaryMuscles: Array.isArray(secondaryMuscles) ? secondaryMuscles : [],
            equipment: Array.isArray(equipment) ? equipment : [equipment || 'Bodyweight'],
            mediaUrl,
            formCues: Array.isArray(formCues) ? formCues : (formCues ? [formCues] : []),
            substitutionTags: Array.isArray(substitutionTags) ? substitutionTags : [],
            difficulty: difficulty || 'beginner'
        });
        res.status(201).json(newExercise);
    }
    catch (error) {
        console.error('[Exercises] Create exercise error:', error);
        res.status(500).json({ error: error?.message || 'Failed to create exercise' });
    }
});
// PUT /api/exercises/:id - Update an exercise (Admin only)
router.put('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const updated = await Exercise_1.ExerciseModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        if (!updated) {
            res.status(404).json({ error: 'Exercise not found' });
            return;
        }
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ error: error?.message || 'Failed to update exercise' });
    }
});
// DELETE /api/exercises/:id - Delete an exercise (Admin only)
router.delete('/:id', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const exercise = await Exercise_1.ExerciseModel.findByIdAndDelete(req.params.id);
        if (!exercise) {
            res.status(404).json({ error: 'Exercise not found' });
            return;
        }
        res.json({ success: true, message: 'Exercise deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error?.message || 'Failed to delete exercise' });
    }
});
exports.default = router;
