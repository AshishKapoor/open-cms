import { Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db/client';

// Validation schemas
const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  published: z.boolean().default(false),
});

const updateProductSchema = createProductSchema.partial();

const createSectionSchema = z.object({
  title: z.string().min(1, 'Section title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  published: z.boolean().default(false),
});

const updateSectionSchema = createSectionSchema.partial();

const createPageSchema = z.object({
  title: z.string().min(1, 'Page title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  published: z.boolean().default(false),
});

const updatePageSchema = createPageSchema.partial();

const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      sidebarPosition: z.number(),
    })
  ),
});

// PRODUCTS CONTROLLERS

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const published = req.query.published === 'true' ? true : undefined;

    const products = await db.documentationProduct.findMany({
      where: published !== undefined ? { published } : undefined,
      include: {
        sections: {
          include: {
            pages: true,
          },
        },
      },
      orderBy: { sidebarPosition: 'asc' },
    });

    res.json({
      success: true,
      data: { products },
    });
  } catch (error) {
    throw error;
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const product = await db.documentationProduct.findFirst({
      where: { slug },
      include: {
        sections: {
          include: {
            pages: {
              orderBy: { sidebarPosition: 'asc' },
            },
          },
          orderBy: { sidebarPosition: 'asc' },
        },
      },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = createProductSchema.parse(req.body);

    // Check if slug already exists
    const existingProduct = await db.documentationProduct.findUnique({
      where: { slug: validatedData.slug },
    });

    if (existingProduct) {
      res.status(400).json({
        error: 'A product with this slug already exists',
      });
      return;
    }

    const product = await db.documentationProduct.create({
      data: validatedData,
    });

    res.status(201).json({
      success: true,
      data: { product },
    });
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData = updateProductSchema.parse(req.body);

    // Check if slug is being changed and if new slug already exists
    if (validatedData.slug) {
      const existingProduct = await db.documentationProduct.findFirst({
        where: {
          slug: validatedData.slug,
          id: { not: id },
        },
      });

      if (existingProduct) {
        res.status(400).json({
          error: 'A product with this slug already exists',
        });
        return;
      }
    }

    const product = await db.documentationProduct.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await db.documentationProduct.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

// SECTIONS CONTROLLERS

export const getSectionsByProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const published = req.query.published === 'true' ? true : undefined;

    const sections = await db.documentationSection.findMany({
      where: {
        productId,
        ...(published !== undefined && { published }),
      },
      include: {
        pages: {
          where: published !== undefined ? { published } : undefined,
          orderBy: { sidebarPosition: 'asc' },
        },
      },
      orderBy: { sidebarPosition: 'asc' },
    });

    res.json({
      success: true,
      data: { sections },
    });
  } catch (error) {
    throw error;
  }
};

export const createSection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params as { productId: string };
    const validatedData = createSectionSchema.parse(req.body);

    // Verify product exists
    const product = await db.documentationProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // Check if slug already exists for this product
    const existingSection = await db.documentationSection.findFirst({
      where: {
        productId,
        slug: validatedData.slug,
      },
    });

    if (existingSection) {
      res.status(400).json({
        error: 'A section with this slug already exists in this product',
      });
      return;
    }

    const section = await db.documentationSection.create({
      data: {
        ...validatedData,
        productId,
      },
      include: {
        pages: true,
      },
    });

    res.status(201).json({
      success: true,
      data: { section },
    });
  } catch (error) {
    throw error;
  }
};

export const updateSection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, sectionId } = req.params;
    const validatedData = updateSectionSchema.parse(req.body);

    // Verify section belongs to this product
    const existingSection = await db.documentationSection.findFirst({
      where: { id: sectionId, productId },
    });

    if (!existingSection) {
      res.status(404).json({ error: 'Section not found in this product' });
      return;
    }

    // Check slug uniqueness if being changed
    if (validatedData.slug && validatedData.slug !== existingSection.slug) {
      const duplicateSlug = await db.documentationSection.findFirst({
        where: {
          productId,
          slug: validatedData.slug,
          id: { not: sectionId },
        },
      });

      if (duplicateSlug) {
        res.status(400).json({
          error: 'A section with this slug already exists in this product',
        });
        return;
      }
    }

    const section = await db.documentationSection.update({
      where: { id: sectionId },
      data: validatedData,
      include: {
        pages: true,
      },
    });

    res.json({
      success: true,
      data: { section },
    });
  } catch (error) {
    throw error;
  }
};

export const deleteSection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId, sectionId } = req.params;

    // Verify section belongs to this product
    const section = await db.documentationSection.findFirst({
      where: { id: sectionId, productId },
    });

    if (!section) {
      res.status(404).json({ error: 'Section not found in this product' });
      return;
    }

    await db.documentationSection.delete({
      where: { id: sectionId },
    });

    res.json({
      success: true,
      message: 'Section deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

export const reorderSections = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;
    const validatedData = reorderSchema.parse(req.body);

    // Update all sections with new positions in a single transaction
    await db.$transaction(
      validatedData.items.map((item) =>
        db.documentationSection.update({
          where: { id: item.id },
          data: { sidebarPosition: item.sidebarPosition },
        })
      )
    );

    const sections = await db.documentationSection.findMany({
      where: { productId },
      orderBy: { sidebarPosition: 'asc' },
    });

    res.json({
      success: true,
      data: { sections },
      message: 'Sections reordered successfully',
    });
  } catch (error) {
    throw error;
  }
};

// PAGES CONTROLLERS

export const getPagesBySection = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sectionId } = req.params;
    const published = req.query.published === 'true' ? true : undefined;

    const pages = await db.documentationPage.findMany({
      where: {
        sectionId,
        ...(published !== undefined && { published }),
      },
      orderBy: { sidebarPosition: 'asc' },
    });

    res.json({
      success: true,
      data: { pages },
    });
  } catch (error) {
    throw error;
  }
};

export const getPageBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sectionId, slug } = req.params;

    const page = await db.documentationPage.findFirst({
      where: {
        sectionId,
        slug,
      },
      include: {
        section: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!page) {
      res.status(404).json({ error: 'Page not found' });
      return;
    }

    res.json({
      success: true,
      data: { page },
    });
  } catch (error) {
    throw error;
  }
};

export const createPage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sectionId } = req.params as { sectionId: string };
    const validatedData = createPageSchema.parse(req.body);

    // Verify section exists
    const section = await db.documentationSection.findUnique({
      where: { id: sectionId },
    });

    if (!section) {
      res.status(404).json({ error: 'Section not found' });
      return;
    }

    // Check if slug already exists for this section
    const existingPage = await db.documentationPage.findFirst({
      where: {
        sectionId,
        slug: validatedData.slug,
      },
    });

    if (existingPage) {
      res.status(400).json({
        error: 'A page with this slug already exists in this section',
      });
      return;
    }

    const page = await db.documentationPage.create({
      data: {
        ...validatedData,
        sectionId,
      },
    });

    res.status(201).json({
      success: true,
      data: { page },
    });
  } catch (error) {
    throw error;
  }
};

export const updatePage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sectionId, pageId } = req.params;
    const validatedData = updatePageSchema.parse(req.body);

    // Verify page belongs to this section
    const existingPage = await db.documentationPage.findFirst({
      where: { id: pageId, sectionId },
    });

    if (!existingPage) {
      res.status(404).json({ error: 'Page not found in this section' });
      return;
    }

    // Check slug uniqueness if being changed
    if (validatedData.slug && validatedData.slug !== existingPage.slug) {
      const duplicateSlug = await db.documentationPage.findFirst({
        where: {
          sectionId,
          slug: validatedData.slug,
          id: { not: pageId },
        },
      });

      if (duplicateSlug) {
        res.status(400).json({
          error: 'A page with this slug already exists in this section',
        });
        return;
      }
    }

    const page = await db.documentationPage.update({
      where: { id: pageId },
      data: validatedData,
    });

    res.json({
      success: true,
      data: { page },
    });
  } catch (error) {
    throw error;
  }
};

export const deletePage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sectionId, pageId } = req.params;

    // Verify page belongs to this section
    const page = await db.documentationPage.findFirst({
      where: { id: pageId, sectionId },
    });

    if (!page) {
      res.status(404).json({ error: 'Page not found in this section' });
      return;
    }

    await db.documentationPage.delete({
      where: { id: pageId },
    });

    res.json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error) {
    throw error;
  }
};

export const reorderPages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { sectionId } = req.params;
    const validatedData = reorderSchema.parse(req.body);

    // Update all pages with new positions (batched in a transaction)
    await db.$transaction(
      validatedData.items.map((item) =>
        db.documentationPage.update({
          where: { id: item.id },
          data: { sidebarPosition: item.sidebarPosition },
        })
      )
    );

    const pages = await db.documentationPage.findMany({
      where: { sectionId },
      orderBy: { sidebarPosition: 'asc' },
    });

    res.json({
      success: true,
      data: { pages },
      message: 'Pages reordered successfully',
    });
  } catch (error) {
    throw error;
  }
};
