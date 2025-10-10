import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllTags,
  getTagById,
  getTagBySlug,
  createTag,
  updateTag,
  deleteTag,
  getPostsByTag,
} from '../controllers/tags';

const router: Router = Router();

// Public routes
router.get('/', getAllTags);
router.get('/slug/:slug', getTagBySlug);
router.get('/:id', getTagById);
router.get('/slug/:slug/posts', getPostsByTag);

// Protected routes (admin only)
router.post('/', authenticate, createTag);
router.put('/:id', authenticate, updateTag);
router.delete('/:id', authenticate, deleteTag);

export default router;
