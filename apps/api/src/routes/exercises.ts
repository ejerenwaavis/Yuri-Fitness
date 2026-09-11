import { Router, Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { ExerciseInstructionModel } from '../models/ExerciseInstruction';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Configure Multer for in-memory upload (up to 100MB video)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files (MP4, WebM, MOV, etc.) are allowed'));
    }
  }
});

// Helper: Stream buffer to Cloudinary
const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video',
        folder: folder || 'yuri-fitness',
        transformation: [
          { quality: 'auto' }
        ]
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed'));
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Seed initial exercises if collection is empty
const SEED_EXERCISES = [
  {
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    difficulty: 'intermediate',
    targetMuscles: ['Upper Chest', 'Front Delts', 'Triceps'],
    description: '1. Set bench to 30-degree incline.\n2. Retract shoulder blades, keep chest proud.\n3. Lower dumbbells with control to outside upper chest (3s tempo).\n4. Press firmly up and slightly in without clanking weights at peak.',
    videoUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_incline.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=60'
  },
  {
    name: 'Barbell Back Squat',
    category: 'Legs',
    difficulty: 'intermediate',
    targetMuscles: ['Quadriceps', 'Glutes', 'Core'],
    description: '1. Set feet shoulder-width apart, toes turned slightly out.\n2. Take deep diaphragmatic breath, brace core 360 degrees.\n3. Break at hips and knees together, sink to parallel depth.\n4. Drive through mid-foot to stand up explosively.',
    videoUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_squat.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=60'
  },
  {
    name: 'Lat Pulldown',
    category: 'Back',
    difficulty: 'beginner',
    targetMuscles: ['Latissimus Dorsi', 'Biceps', 'Rhomboids'],
    description: '1. Grip bar slightly wider than shoulder width.\n2. Lean back 10-15 degrees, depress and retract scapulae.\n3. Drive elbows down and back toward ribcage to touch collarbone.\n4. Control the ascent to full overhead stretch.',
    videoUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_lat.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=60'
  },
  {
    name: 'Standing Dumbbell Shoulder Press',
    category: 'Shoulders',
    difficulty: 'intermediate',
    targetMuscles: ['Anterior Deltoid', 'Lateral Deltoid', 'Triceps'],
    description: '1. Stand tall with feet hip-width, glutes engaged.\n2. Hold dumbbells at shoulder level with neutral/semi-pronated grip.\n3. Press overhead in a controlled arc without hyperextending spine.\n4. Lower slowly back to ear height.',
    videoUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_press.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=60'
  },
  {
    name: 'Romanian Deadlift (RDL)',
    category: 'Legs',
    difficulty: 'intermediate',
    targetMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae'],
    description: '1. Hold dumbbells in front of thighs with slight knee bend.\n2. Push hips backward toward the wall behind you.\n3. Keep back flat and barbell close to legs until deep hamstring stretch.\n4. Squeeze glutes and extend hips forward to return.',
    videoUrl: 'https://res.cloudinary.com/dshxh9vrz/video/upload/yuri-fitness/sample_rdl.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60'
  }
];

const checkAndSeedExercises = async () => {
  try {
    const count = await ExerciseInstructionModel.countDocuments();
    if (count === 0) {
      console.log('[Exercises] Seeding initial exercise video library...');
      await ExerciseInstructionModel.insertMany(SEED_EXERCISES);
      console.log('[Exercises] Seed completed successfully');
    }
  } catch (err) {
    console.warn('[Exercises] Seeding check error:', err);
  }
};

// Seed on module load
checkAndSeedExercises();

// POST /api/exercises/upload - Upload video file directly to Cloudinary (Admin only)
router.post(
  '/upload',
  authenticateToken,
  requireAdmin,
  upload.single('video'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No video file provided' });
        return;
      }

      const folder = process.env.CLOUDINARY_FOLDER || 'yuri-fitness';
      const result = await uploadToCloudinary(req.file.buffer, folder);

      // Auto-generate thumbnail URL using Cloudinary URL helper
      const thumbnailUrl = cloudinary.url(result.public_id, {
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
    } catch (error: any) {
      console.error('[Exercises] Cloudinary upload error:', error);
      res.status(500).json({ error: error?.message || 'Video upload failed' });
    }
  }
);

// GET /api/exercises - List all exercises (Public read)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    const filter: Record<string, any> = {};

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

    const exercises = await ExerciseInstructionModel.find(filter).sort({ createdAt: -1 });
    res.json(exercises);
  } catch (error: any) {
    console.error('[Exercises] Get exercises error:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch exercises' });
  }
});

// GET /api/exercises/:id - Get a single exercise (Public read)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const exercise = await ExerciseInstructionModel.findById(req.params.id);
    if (!exercise) {
      res.status(404).json({ error: 'Exercise not found' });
      return;
    }
    res.json(exercise);
  } catch (error: any) {
    console.error('[Exercises] Get exercise error:', error);
    res.status(500).json({ error: error?.message || 'Failed to fetch exercise' });
  }
});

// POST /api/exercises - Create a new exercise instruction (Admin only)
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        name,
        category,
        description,
        videoUrl,
        thumbnailUrl,
        cloudinaryPublicId,
        targetMuscles,
        difficulty
      } = req.body;

      if (!name || !videoUrl || !description) {
        res.status(400).json({ error: 'Name, videoUrl, and description are required' });
        return;
      }

      const newExercise = await ExerciseInstructionModel.create({
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
    } catch (error: any) {
      console.error('[Exercises] Create exercise error:', error);
      res.status(500).json({ error: error?.message || 'Failed to create exercise' });
    }
  }
);

// DELETE /api/exercises/:id - Delete an exercise and its Cloudinary video (Admin only)
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const exercise = await ExerciseInstructionModel.findById(req.params.id);
      if (!exercise) {
        res.status(404).json({ error: 'Exercise not found' });
        return;
      }

      // Delete from Cloudinary if publicId is stored
      if (exercise.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(exercise.cloudinaryPublicId, { resource_type: 'video' });
        } catch (cloudErr) {
          console.warn('[Exercises] Cloudinary asset delete warning:', cloudErr);
        }
      }

      await ExerciseInstructionModel.findByIdAndDelete(req.params.id);
      res.json({ success: true, message: 'Exercise instruction deleted' });
    } catch (error: any) {
      console.error('[Exercises] Delete exercise error:', error);
      res.status(500).json({ error: error?.message || 'Failed to delete exercise' });
    }
  }
);

export default router;
