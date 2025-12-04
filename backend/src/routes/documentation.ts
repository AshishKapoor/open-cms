import { Router } from 'express';
import type { Router as RouterType } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getSectionsByProduct,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  getPagesBySection,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
} from '../controllers/documentation';

const router: RouterType = Router();

// Middleware to check admin status
const adminOnly = (req: any, res: any, next: any) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * @swagger
 * tags:
 *   - name: Documentation
 *     description: Product documentation management with sections and pages
 */

/**
 * @swagger
 * /api/documentation/products:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: Get all products
 *     parameters:
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: List of products with their sections and pages
 */
router.get('/products', getAllProducts);

/**
 * @swagger
 * /api/documentation/products/{slug}:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: Get product by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/products/:slug', getProductBySlug);

/**
 * @swagger
 * /api/documentation/products:
 *   post:
 *     tags:
 *       - Documentation
 *     summary: Create a new product (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Product created successfully
 *       403:
 *         description: Admin access required
 */
router.post('/products', authenticate, adminOnly, createProduct);

/**
 * @swagger
 * /api/documentation/products/{id}:
 *   put:
 *     tags:
 *       - Documentation
 *     summary: Update a product (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 */
router.put('/products/:id', authenticate, adminOnly, updateProduct);

/**
 * @swagger
 * /api/documentation/products/{id}:
 *   delete:
 *     tags:
 *       - Documentation
 *     summary: Delete a product (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/products/:id', authenticate, adminOnly, deleteProduct);

// SECTIONS ROUTES

/**
 * @swagger
 * /api/documentation/products/{productId}/sections:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: Get sections for a product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 */
router.get('/products/:productId/sections', getSectionsByProduct);

/**
 * @swagger
 * /api/documentation/products/{productId}/sections:
 *   post:
 *     tags:
 *       - Documentation
 *     summary: Create a new section (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 */
router.post(
  '/products/:productId/sections',
  authenticate,
  adminOnly,
  createSection
);

/**
 * @swagger
 * /api/documentation/products/{productId}/sections/{sectionId}:
 *   put:
 *     tags:
 *       - Documentation
 *     summary: Update a section (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/products/:productId/sections/:sectionId',
  authenticate,
  adminOnly,
  updateSection
);

/**
 * @swagger
 * /api/documentation/products/{productId}/sections/{sectionId}:
 *   delete:
 *     tags:
 *       - Documentation
 *     summary: Delete a section (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/products/:productId/sections/:sectionId',
  authenticate,
  adminOnly,
  deleteSection
);

/**
 * @swagger
 * /api/documentation/products/{productId}/sections/reorder:
 *   post:
 *     tags:
 *       - Documentation
 *     summary: Reorder sections in a product (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/products/:productId/sections/reorder',
  authenticate,
  adminOnly,
  reorderSections
);

// PAGES ROUTES

/**
 * @swagger
 * /api/documentation/sections/{sectionId}/pages:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: Get pages in a section
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 */
router.get('/sections/:sectionId/pages', getPagesBySection);

/**
 * @swagger
 * /api/documentation/sections/{sectionId}/pages/{slug}:
 *   get:
 *     tags:
 *       - Documentation
 *     summary: Get a page by slug
 *     parameters:
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/sections/:sectionId/pages/:slug', getPageBySlug);

/**
 * @swagger
 * /api/documentation/sections/{sectionId}/pages:
 *   post:
 *     tags:
 *       - Documentation
 *     summary: Create a new page (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.post('/sections/:sectionId/pages', authenticate, adminOnly, createPage);

/**
 * @swagger
 * /api/documentation/sections/{sectionId}/pages/{pageId}:
 *   put:
 *     tags:
 *       - Documentation
 *     summary: Update a page (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/sections/:sectionId/pages/:pageId',
  authenticate,
  adminOnly,
  updatePage
);

/**
 * @swagger
 * /api/documentation/sections/{sectionId}/pages/{pageId}:
 *   delete:
 *     tags:
 *       - Documentation
 *     summary: Delete a page (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/sections/:sectionId/pages/:pageId',
  authenticate,
  adminOnly,
  deletePage
);

/**
 * @swagger
 * /api/documentation/sections/{sectionId}/pages/reorder:
 *   post:
 *     tags:
 *       - Documentation
 *     summary: Reorder pages in a section (admin only)
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/sections/:sectionId/pages/reorder',
  authenticate,
  adminOnly,
  reorderPages
);

export default router;
