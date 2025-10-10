import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../utils/config';
import { db } from '../db/client';
import { verifyRecaptcha } from '../utils/recaptcha';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  recaptchaToken: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  recaptchaToken: z.string().optional(),
});

const updateProfileSchema = z.object({
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

// Helper function to generate JWT token
const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, config.JWT_SECRET, { expiresIn: '7d' });
};

// Helper function to exclude password from user object
const excludePassword = <T extends { password: string }>(
  user: T
): Omit<T, 'password'> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    // Verify reCAPTCHA if token is provided
    if (validatedData.recaptchaToken) {
      const clientIp =
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.headers['x-forwarded-for'] as string)?.split(',')[0];

      const isRecaptchaValid = await verifyRecaptcha(
        validatedData.recaptchaToken,
        clientIp
      );

      if (!isRecaptchaValid) {
        res.status(400).json({
          error: 'CAPTCHA verification failed. Please try again.',
          code: 'CAPTCHA_FAILED',
        });
        return;
      }
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username },
        ],
      },
    });

    if (existingUser) {
      const field =
        existingUser.email === validatedData.email ? 'email' : 'username';
      res.status(400).json({ error: `User with this ${field} already exists` });
      return;
    }

    // Check if this is the first user (should be admin)
    const userCount = await db.user.count();
    const isFirstUser = userCount === 0;

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      saltRounds
    );

    // Create user
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        isAdmin: isFirstUser, // First user becomes admin
      },
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    // Return user data without password
    const userResponse = excludePassword(user);

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Verify reCAPTCHA if token is provided
    if (validatedData.recaptchaToken) {
      const clientIp =
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.headers['x-forwarded-for'] as string)?.split(',')[0];

      const isRecaptchaValid = await verifyRecaptcha(
        validatedData.recaptchaToken,
        clientIp
      );

      if (!isRecaptchaValid) {
        res.status(400).json({
          error: 'CAPTCHA verification failed. Please try again.',
          code: 'CAPTCHA_FAILED',
        });
        return;
      }
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user.id, user.email);

    // Return user data without password
    const userResponse = excludePassword(user);

    res.json({
      success: true,
      data: {
        user: userResponse,
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const validatedData = updateProfileSchema.parse(req.body);

    // Prepare update data
    const updateData: { avatar?: string | null; bio?: string | null } = {};

    if (validatedData.avatar !== undefined) {
      updateData.avatar =
        validatedData.avatar === '' ? null : validatedData.avatar;
    }

    if (validatedData.bio !== undefined) {
      updateData.bio = validatedData.bio === '' ? null : validatedData.bio;
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin-only endpoint to get all users
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      res
        .status(403)
        .json({ error: 'Access denied. Admin privileges required.' });
      return;
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin-only endpoint to update user admin status
export const updateUserAdminStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      res
        .status(403)
        .json({ error: 'Access denied. Admin privileges required.' });
      return;
    }

    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      res.status(400).json({ error: 'isAdmin must be a boolean value' });
      return;
    }

    // Prevent user from removing their own admin status
    if (userId === req.user.id && !isAdmin) {
      res
        .status(400)
        .json({ error: 'Cannot remove admin status from yourself' });
      return;
    }

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update user admin status
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { isAdmin },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Update user admin status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
