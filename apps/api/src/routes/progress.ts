import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { ProgressMetricModel } from '../models/ProgressMetric';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Configure Multer for photo uploads (max 10MB)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for progress photos'));
    }
  }
});

// Helper to stream image to Cloudinary
const uploadImageToCloudinary = (buffer: Buffer): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'yuri-fitness/progress',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error('Upload failed'));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// POST /api/progress/upload-photo - Upload front, side, or back progress photo
router.post('/upload-photo', optionalAuth, upload.single('photo'), async (req: Request, res: Response): Promise<void> => {
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
  } catch (err: any) {
    console.error('[Progress] Photo upload error:', err);
    res.status(500).json({ error: err.message || 'Photo upload failed' });
  }
});

// GET /api/progress - List all progress metrics
router.get('/', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest';
    const filter = userId === 'guest' ? {} : { userId };

    const metrics = await ProgressMetricModel.find(filter).sort({ date: -1 });
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/progress/weight-history - Lightweight chart data
router.get('/weight-history', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest';
    const filter: Record<string, any> = { weight: { $exists: true, $ne: null } };
    if (userId !== 'guest') filter.userId = userId;

    const data = await ProgressMetricModel.find(filter)
      .sort({ date: 1 })
      .select('date weight');

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/progress/compare - Compare photos between two dates
router.get('/compare', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { idA, idB } = req.query;
    if (!idA || !idB) {
      res.status(400).json({ error: 'idA and idB query parameters are required' });
      return;
    }

    const entryA = await ProgressMetricModel.findById(idA);
    const entryB = await ProgressMetricModel.findById(idB);

    res.json({
      entryA,
      entryB
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/progress - Save a new progress metric snapshot
router.post('/', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || 'guest';
    const { date, weight, measurements, photoUrls } = req.body;

    const newMetric = await ProgressMetricModel.create({
      userId,
      date: date || new Date().toISOString(),
      weight: weight ? Number(weight) : undefined,
      measurements: measurements || {},
      photoUrls: Array.isArray(photoUrls) ? photoUrls : []
    });

    res.status(201).json(newMetric);
  } catch (err: any) {
    console.error('[Progress] Save error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/progress/:id - Delete metric
router.delete('/:id', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    await ProgressMetricModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
