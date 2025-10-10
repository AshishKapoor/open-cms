import { Router } from 'express';
import type { Router as RouterType } from 'express';
import {
  subscribeToNewsletter,
  getNewsletterSubscribers,
  exportNewsletterSubscribers,
  unsubscribeFromNewsletter,
} from '../controllers/newsletter';
import { authenticate } from '../middleware/auth';

const router: RouterType = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     NewsletterSubscriber:
 *       type: object
 *       required:
 *         - id
 *         - email
 *         - subscribedAt
 *         - isActive
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the subscriber
 *         email:
 *           type: string
 *           format: email
 *           description: The subscriber email
 *         subscribedAt:
 *           type: string
 *           format: date-time
 *           description: The date the user subscribed
 *         isActive:
 *           type: boolean
 *           description: Whether the subscription is active
 *     NewsletterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             subscriber:
 *               $ref: '#/components/schemas/NewsletterSubscriber'
 */

/**
 * @swagger
 * /api/newsletter/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to subscribe
 *     responses:
 *       201:
 *         description: Successfully subscribed to newsletter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewsletterResponse'
 *       200:
 *         description: Successfully resubscribed to newsletter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewsletterResponse'
 *       400:
 *         description: Validation error or email already subscribed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.post('/subscribe', subscribeToNewsletter);

/**
 * @swagger
 * /api/newsletter/unsubscribe:
 *   post:
 *     summary: Unsubscribe from newsletter
 *     tags: [Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to unsubscribe
 *     responses:
 *       200:
 *         description: Successfully unsubscribed from newsletter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Validation error or email already unsubscribed
 *       404:
 *         description: Email not found in newsletter list
 *       500:
 *         description: Internal server error
 */
router.post('/unsubscribe', unsubscribeFromNewsletter);

/**
 * @swagger
 * /api/newsletter/subscribers:
 *   get:
 *     summary: Get all newsletter subscribers (Admin only)
 *     tags: [Newsletter]
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
 *           default: 50
 *         description: Number of subscribers per page
 *     responses:
 *       200:
 *         description: List of newsletter subscribers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscribers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NewsletterSubscriber'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/subscribers', authenticate, getNewsletterSubscribers);

/**
 * @swagger
 * /api/newsletter/export:
 *   get:
 *     summary: Export newsletter subscribers to Excel (Admin only)
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Excel file with newsletter subscribers
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get('/export', authenticate, exportNewsletterSubscribers);

export default router;
