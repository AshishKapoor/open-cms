import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/client';

// Validation schemas
const createPostSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z
    .string()
    .max(500, 'Excerpt must be less than 500 characters')
    .optional(),
  coverImage: z.string().url().optional(),
  published: z.boolean().default(false),
  tagIds: z.array(z.string()).optional(),
  createdAt: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Please enter a valid date and time'
    ),
});

const updatePostSchema = createPostSchema.partial();

// Helper function to generate slug from title
const generateSlug = (title: string): string => {
  return title
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
    const existingPost = await db.post.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    if (!existingPost) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

export const getAllPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const author = req.query.author as string;
    const tags = req.query.tags as string; // Comma-separated tag slugs
    const published =
      req.query.published === 'true'
        ? true
        : req.query.published === 'false'
          ? false
          : undefined;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (author) {
      where.author = {
        OR: [
          { username: { contains: author, mode: 'insensitive' } },
          { firstName: { contains: author, mode: 'insensitive' } },
          { lastName: { contains: author, mode: 'insensitive' } },
        ],
      };
    }

    if (published !== undefined) {
      where.published = published;
    }

    if (tags) {
      const tagSlugs = tags.split(',').map((slug) => slug.trim());
      where.tags = {
        some: {
          tag: {
            slug: {
              in: tagSlugs,
            },
          },
        },
      };
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
    console.error('Get all posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPostById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Post ID is required' });
      return;
    }

    const post = await db.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPostBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    if (!slug) {
      res.status(400).json({ error: 'Post slug is required' });
      return;
    }

    const post = await db.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    console.error('Get post by slug error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPost = async (
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
      res.status(403).json({
        error: 'Access denied. Admin privileges required to create posts.',
      });
      return;
    }

    const validatedData = createPostSchema.parse(req.body);

    // Generate slug from title
    const baseSlug = generateSlug(validatedData.title);
    const slug = await ensureUniqueSlug(baseSlug);

    // Prepare the data for post creation
    const postData: any = {
      title: validatedData.title,
      slug,
      content: validatedData.content,
      excerpt: validatedData.excerpt,
      coverImage: validatedData.coverImage,
      published: validatedData.published,
      publishedAt: validatedData.published ? new Date() : null,
      authorId: req.user.id,
    };

    // Only set createdAt if explicitly provided, otherwise let Prisma use default
    if (validatedData.createdAt) {
      postData.createdAt = new Date(validatedData.createdAt);
    }

    const post = await db.post.create({
      data: postData,
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
    });

    // Handle tag associations after post creation
    if (validatedData.tagIds && validatedData.tagIds.length > 0) {
      await db.postTag.createMany({
        data: validatedData.tagIds.map((tagId) => ({
          postId: post.id,
          tagId: tagId,
        })),
      });

      // Refetch the post with tags
      const postWithTags = await db.post.findUnique({
        where: { id: post.id },
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
      });

      res.status(201).json({
        success: true,
        data: { post: postWithTags },
      });
    } else {
      res.status(201).json({
        success: true,
        data: { post },
      });
    }
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

    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePost = async (
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
      res.status(403).json({
        error: 'Access denied. Admin privileges required to update posts.',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Post ID is required' });
      return;
    }

    const validatedData = updatePostSchema.parse(req.body);

    // Check if post exists and user owns it
    const existingPost = await db.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (existingPost.authorId !== req.user.id) {
      res.status(403).json({ error: 'Not authorized to update this post' });
      return;
    }

    // Remove tagIds from updateData as it's not a direct field in Post model
    const { tagIds, ...postUpdateFields } = validatedData;
    const updateData: any = { ...postUpdateFields };

    // Update slug if title changed
    if (validatedData.title && validatedData.title !== existingPost.title) {
      const baseSlug = generateSlug(validatedData.title);
      updateData.slug = await ensureUniqueSlug(baseSlug, id);
    }

    // Update createdAt if provided (and different from existing)
    if (validatedData.createdAt) {
      const newCreatedAt = new Date(validatedData.createdAt);
      const existingCreatedAt = existingPost.createdAt;

      // Only update if the dates are actually different
      if (newCreatedAt.getTime() !== existingCreatedAt.getTime()) {
        updateData.createdAt = newCreatedAt;
      }
    }

    // Update publishedAt if publishing for first time
    if (validatedData.published === true && !existingPost.published) {
      updateData.publishedAt = new Date();
    } else if (validatedData.published === false) {
      updateData.publishedAt = null;
    }

    // Handle tag updates separately
    if (validatedData.tagIds !== undefined) {
      // First delete all existing tag associations for this post
      await db.postTag.deleteMany({
        where: { postId: id },
      });

      // Then create new tag associations
      if (validatedData.tagIds.length > 0) {
        await db.postTag.createMany({
          data: validatedData.tagIds.map((tagId) => ({
            postId: id,
            tagId: tagId,
          })),
        });
      }
    }

    const post = await db.post.update({
      where: { id },
      data: updateData,
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
    });

    res.json({
      success: true,
      data: { post },
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

    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePost = async (
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
      res.status(403).json({
        error: 'Access denied. Admin privileges required to delete posts.',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Post ID is required' });
      return;
    }

    // Check if post exists and user owns it
    const existingPost = await db.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    if (existingPost.authorId !== req.user.id) {
      res.status(403).json({ error: 'Not authorized to delete this post' });
      return;
    }

    await db.post.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyPosts = async (
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
      res.status(403).json({
        error: 'Access denied. Admin privileges required to manage posts.',
      });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [posts, totalCount] = await Promise.all([
      db.post.findMany({
        where: { authorId: req.user.id },
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
      db.post.count({ where: { authorId: req.user.id } }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
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
    console.error('Get my posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
