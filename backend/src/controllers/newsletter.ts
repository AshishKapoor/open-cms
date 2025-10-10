import type { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

// Validation schemas
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
});

/**
 * Subscribe to newsletter
 * POST /api/newsletter/subscribe
 */
export const subscribeToNewsletter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = subscribeSchema.parse(req.body);

    // Check if email is already subscribed
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          error: 'Email is already subscribed to our newsletter',
        });
      } else {
        // Reactivate subscription
        const updatedSubscriber = await prisma.newsletterSubscriber.update({
          where: { email },
          data: { isActive: true, subscribedAt: new Date() },
        });

        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter',
          data: { subscriber: updatedSubscriber },
        });
      }
    }

    // Create new subscription
    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email },
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: { subscriber },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    console.error('Newsletter subscription error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Get all newsletter subscribers (Admin only)
 * GET /api/newsletter/subscribers
 */
export const getNewsletterSubscribers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Check if user is admin
    const user = (req as any).user;
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
        orderBy: { subscribedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({
        where: { isActive: true },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get newsletter subscribers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Export newsletter subscribers to Excel (Admin only)
 * GET /api/newsletter/export
 */
export const exportNewsletterSubscribers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Check if user is admin
    const user = (req as any).user;
    if (!user || !user.isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
      return;
    }

    // Get all active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      orderBy: { subscribedAt: 'desc' },
      select: {
        id: true,
        email: true,
        subscribedAt: true,
      },
    });

    // Prepare data for Excel export
    const excelData = subscribers.map((subscriber: any, index: number) => ({
      'S.No': index + 1,
      Email: subscriber.email,
      'Subscribed Date': subscriber.subscribedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      'Subscribed Time': subscriber.subscribedAt.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 8 }, // S.No
      { wch: 30 }, // Email
      { wch: 15 }, // Subscribed Date
      { wch: 15 }, // Subscribed Time
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Newsletter Subscribers');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    });

    // Set response headers
    const fileName = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    // Send file
    res.send(excelBuffer);
  } catch (error) {
    console.error('Export newsletter subscribers error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Unsubscribe from newsletter
 * POST /api/newsletter/unsubscribe
 */
export const unsubscribeFromNewsletter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email } = subscribeSchema.parse(req.body);

    // Check if email exists
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: 'Email not found in our newsletter list',
      });
    }

    if (!subscriber.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Email is already unsubscribed',
      });
    }

    // Deactivate subscription
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: false },
    });

    return res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    console.error('Newsletter unsubscription error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
