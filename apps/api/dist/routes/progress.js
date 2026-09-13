"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const ProgressMetric_1 = require("../models/ProgressMetric");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Configure Multer for photo uploads (max 10MB)
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed for progress photos'));
        }
    }
});
// Helper to stream image to Cloudinary
const uploadImageToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder: 'yuri-fitness/progress',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }]
        }, (err, result) => {
            if (err || !result)
                return reject(err || new Error('Upload failed'));
            resolve(result);
        });
        stream.end(buffer);
    });
};
// POST /api/progress/upload-photo - Upload front, side, or back progress photo
router.post('/upload-photo', auth_1.optionalAuth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No image file uploaded' });
            return;
        }
        const result = await uploadImageToCloudinary(req.file.buffer);
        res.json({
            success: true,
            url: result.secure_url,
            publicId: result.public_id
        });
    }
    catch (err) {
        console.error('[Progress] Photo upload error:', err);
        res.status(500).json({ error: err.message || 'Photo upload failed' });
    }
});
// GET /api/progress - List all progress metrics
router.get('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id || 'guest';
        const filter = userId === 'guest' ? {} : { userId };
        const metrics = await ProgressMetric_1.ProgressMetricModel.find(filter).sort({ date: -1 });
        res.json(metrics);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/progress/weight-history - Lightweight chart data
router.get('/weight-history', auth_1.optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id || 'guest';
        const filter = { weight: { $exists: true, $ne: null } };
        if (userId !== 'guest')
            filter.userId = userId;
        const data = await ProgressMetric_1.ProgressMetricModel.find(filter)
            .sort({ date: 1 })
            .select('date weight');
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET /api/progress/compare - Compare photos between two dates
router.get('/compare', auth_1.optionalAuth, async (req, res) => {
    try {
        const { idA, idB } = req.query;
        if (!idA || !idB) {
            res.status(400).json({ error: 'idA and idB query parameters are required' });
            return;
        }
        const entryA = await ProgressMetric_1.ProgressMetricModel.findById(idA);
        const entryB = await ProgressMetric_1.ProgressMetricModel.findById(idB);
        res.json({
            entryA,
            entryB
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST /api/progress - Save a new progress metric snapshot
router.post('/', auth_1.optionalAuth, async (req, res) => {
    try {
        const userId = req.user?.id || 'guest';
        const { date, weight, measurements, photoUrls } = req.body;
        const newMetric = await ProgressMetric_1.ProgressMetricModel.create({
            userId,
            date: date || new Date().toISOString(),
            weight: weight ? Number(weight) : undefined,
            measurements: measurements || {},
            photoUrls: Array.isArray(photoUrls) ? photoUrls : []
        });
        res.status(201).json(newMetric);
    }
    catch (err) {
        console.error('[Progress] Save error:', err);
        res.status(500).json({ error: err.message });
    }
});
// DELETE /api/progress/:id - Delete metric
router.delete('/:id', auth_1.optionalAuth, async (req, res) => {
    try {
        await ProgressMetric_1.ProgressMetricModel.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
