import { Router } from 'express';
import type { Router as RouterType } from 'express';
import {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
} from '../controllers/posts';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - id
 *         - title
 *         - slug
 *         - content
 *         - authorId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the post
 *         title:
 *           type: string
 *           description: The post title
 *         slug:
 *           type: string
 *           description: The post slug
 *         content:
 *           type: string
 *           description: The post content
 *         excerpt:
 *           type: string
 *           description: The post excerpt
 *         coverImage:
 *           type: string
 *           description: The post cover image URL
 *         published:
 *           type: boolean
 *           description: Whether the post is published
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was published
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the post was last updated
 *         authorId:
 *           type: string
 *           description: The author's user id
 *         author:
 *           $ref: '#/components/schemas/User'
 *     PostsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             posts:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *                 totalCount:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *                 hasNextPage:
 *                   type: boolean
 *                 hasPrevPage:
 *                   type: boolean
 *     PostResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             post:
 *               $ref: '#/components/schemas/Post'
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, content, and excerpt
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author username or name
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostsResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllPosts);

/**
 * @swagger
 * /api/posts/my:
 *   get:
 *     summary: Get current user's posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: List of user's posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostsResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/my', authenticate, getMyPosts);

/**
 * @swagger
 * /api/posts/slug/{slug}:
 *   get:
 *     summary: Get post by slug
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The post slug
 *     responses:
 *       200:
 *         description: Post data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.get('/slug/:slug', getPostBySlug);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post id
 *     responses:
 *       200:
 *         description: Post data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getPostById);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *                 maxLength: 500
 *               coverImage:
 *                 type: string
 *                 format: uri
 *               published:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, createPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *                 maxLength: 500
 *               coverImage:
 *                 type: string
 *                 format: uri
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the post author
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, updatePost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post id
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - not the post author
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, deletePost);

export default router;
