import { Router, type Router as RouterType } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth';
import { uploadImage } from '../controllers/upload';

const router: RouterType = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * @route   POST /api/upload/image
 * @desc    Upload an image to MinIO storage
 * @access  Private (requires authentication)
 */
router.post('/image', authenticate, upload.single('image'), uploadImage);

export default router;
