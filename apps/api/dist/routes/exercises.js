"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const ExerciseInstruction_1 = require("../models/ExerciseInstruction");
const router = (0, express_1.Router)();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});
// Configure Multer for in-memory upload (up to 100MB video)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100 MB
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only video files (MP4, WebM, MOV, etc.) are allowed'));
        }
    }
});
// Helper: Stream buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            resource_type: 'video',
            folder: folder || 'yuri-fitness',
            transformation: [
                { quality: 'auto' }
            ]
        }, (error, result) => {
            if (error || !result) {
                return reject(error || new Error('Upload to Cloudinary failed'));
            }
            resolve(result);
        });
        stream.end(buffer);
    });
};
// POST /api/exercises/upload - Upload video file directly to Cloudinary
router.post('/upload', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No video file provided' });
            return;
        }
        const folder = process.env.CLOUDINARY_FOLDER || 'yuri-fitness';
        const result = await uploadToCloudinary(req.file.buffer, folder);
        // Auto-generate thumbnail URL using Cloudinary URL helper or fallback extension
        const thumbnailUrl = cloudinary_1.v2.url(result.public_id, {
            resource_type: 'video',
            format: 'jpg',
            start_offset: '1.0'
        });
        res.json({
            success: true,
            videoUrl: result.secure_url,
            publicId: result.public_id,
            thumbnailUrl,
            duration: result.duration,
            format: result.format
        });
    }
    catch (error) {
        console.error('[Exercises] Cloudinary upload error:', error);
        res.status(500).json({ error: error?.message || 'Video upload failed' });
    }
});
// GET /api/exercises - List all exercises (with optional filter by category)
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        const filter = {};
        if (category && category !== 'All') {
            filter.category = category;
        }
        if (search && typeof search === 'string' && search.trim()) {
            filter.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } },
                { targetMuscles: { $regex: search.trim(), $options: 'i' } }
            ];
        }
        const exercises = await ExerciseInstruction_1.ExerciseInstructionModel.find(filter).sort({ createdAt: -1 });
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
        const exercise = await ExerciseInstruction_1.ExerciseInstructionModel.findById(req.params.id);
        if (!exercise) {
            res.status(404).json({ error: 'Exercise not found' });
            return;
        }
        res.json(exercise);
    }
    catch (error) {
        console.error('[Exercises] Get exercise error:', error);
        res.status(500).json({ error: error?.message || 'Failed to fetch exercise' });
    }
});
// POST /api/exercises - Create a new exercise instruction
router.post('/', async (req, res) => {
    try {
        const { name, category, description, videoUrl, thumbnailUrl, cloudinaryPublicId, targetMuscles, difficulty } = req.body;
        if (!name || !videoUrl || !description) {
            res.status(400).json({ error: 'Name, videoUrl, and description are required' });
            return;
        }
        const newExercise = await ExerciseInstruction_1.ExerciseInstructionModel.create({
            name,
            category: category || 'Chest',
            description,
            videoUrl,
            thumbnailUrl: thumbnailUrl || '',
            cloudinaryPublicId: cloudinaryPublicId || '',
            targetMuscles: Array.isArray(targetMuscles)
                ? targetMuscles
                : (targetMuscles ? String(targetMuscles).split(',').map(s => s.trim()) : []),
            difficulty: difficulty || 'beginner'
        });
        res.status(201).json(newExercise);
    }
    catch (error) {
        console.error('[Exercises] Create exercise error:', error);
        res.status(500).json({ error: error?.message || 'Failed to create exercise' });
    }
});
// DELETE /api/exercises/:id - Delete an exercise and its Cloudinary video
router.delete('/:id', async (req, res) => {
    try {
        const exercise = await ExerciseInstruction_1.ExerciseInstructionModel.findById(req.params.id);
        if (!exercise) {
            res.status(404).json({ error: 'Exercise not found' });
            return;
        }
        // Delete from Cloudinary if publicId is stored
        if (exercise.cloudinaryPublicId) {
            try {
                await cloudinary_1.v2.uploader.destroy(exercise.cloudinaryPublicId, { resource_type: 'video' });
            }
            catch (cloudErr) {
                console.warn('[Exercises] Cloudinary asset delete warning:', cloudErr);
            }
        }
        await ExerciseInstruction_1.ExerciseInstructionModel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Exercise instruction deleted' });
    }
    catch (error) {
        console.error('[Exercises] Delete exercise error:', error);
        res.status(500).json({ error: error?.message || 'Failed to delete exercise' });
    }
});
exports.default = router;
