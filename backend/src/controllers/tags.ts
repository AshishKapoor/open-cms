import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/client';

// Validation schemas
const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  description: z
    .string()
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color code')
    .optional(),
});

const updateTagSchema = createTagSchema.partial();

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Helper function to ensure unique slug
const ensureUniqueSlug = async (
  baseSlug: string,
  excludeId?: string
): Promise<string> => {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingTag = await db.tag.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (!existingTag) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

export const getAllTags = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;
    const includePostCount = req.query.includePostCount === 'true';

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tags, totalCount] = await Promise.all([
      db.tag.findMany({
        where,
        include: includePostCount
          ? {
              _count: {
                select: { posts: true },
              },
            }
          : undefined,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      db.tag.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        tags,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get all tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTagById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Tag ID is required' });
      return;
    }

    const tag = await db.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json({
      success: true,
      data: { tag },
    });
  } catch (error) {
    console.error('Get tag by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTagBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      res.status(400).json({ error: 'Tag slug is required' });
      return;
    }

    const tag = await db.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json({
      success: true,
      data: { tag },
    });
  } catch (error) {
    console.error('Get tag by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTag = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      res.status(403).json({
        error: 'Access denied. Admin privileges required to create tags.',
      });
      return;
    }

    const validatedData = createTagSchema.parse(req.body);

    // Generate slug from name
    const baseSlug = generateSlug(validatedData.name);
    const slug = await ensureUniqueSlug(baseSlug);

    // Check if tag name already exists
    const existingTag = await db.tag.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingTag) {
      res.status(400).json({
        error: 'Tag with this name already exists',
      });
      return;
    }

    const tag = await db.tag.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description,
        color: validatedData.color,
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: { tag },
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

    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTag = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      res.status(403).json({
        error: 'Access denied. Admin privileges required to update tags.',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Tag ID is required' });
      return;
    }

    const validatedData = updateTagSchema.parse(req.body);

    // Check if tag exists
    const existingTag = await db.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    const updateData: any = { ...validatedData };

    // Update slug if name changed
    if (validatedData.name && validatedData.name !== existingTag.name) {
      // Check if new name already exists
      const nameExists = await db.tag.findFirst({
        where: {
          name: {
            equals: validatedData.name,
            mode: 'insensitive',
          },
          id: { not: id },
        },
      });

      if (nameExists) {
        res.status(400).json({
          error: 'Tag with this name already exists',
        });
        return;
      }

      const baseSlug = generateSlug(validatedData.name);
      updateData.slug = await ensureUniqueSlug(baseSlug, id);
    }

    const tag = await db.tag.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    res.json({
      success: true,
      data: { tag },
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

    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTag = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      res.status(403).json({
        error: 'Access denied. Admin privileges required to delete tags.',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Tag ID is required' });
      return;
    }

    // Check if tag exists
    const existingTag = await db.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!existingTag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    // Check if tag is being used by any posts
    if (existingTag._count.posts > 0) {
      res.status(400).json({
        error: `Cannot delete tag "${existingTag.name}" as it is being used by ${existingTag._count.posts} post(s). Please remove the tag from all posts first.`,
      });
      return;
    }

    await db.tag.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Tag deleted successfully',
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPostsByTag = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      res.status(400).json({ error: 'Tag slug is required' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const published = req.query.published === 'false' ? false : true;

    const skip = (page - 1) * limit;

    // First, find the tag
    const tag = await db.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    // Find posts with this tag
    const where: any = {
      tags: {
        some: {
          tagId: tag.id,
        },
      },
    };

    if (published !== undefined) {
      where.published = published;
    }

    const [posts, totalCount] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        tag,
        posts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get posts by tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
