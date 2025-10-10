import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      username: 'johndoe',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      bio: 'A passionate writer and developer who loves sharing knowledge through blog posts.',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      username: 'janesmith',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      bio: 'Tech enthusiast and blogger with a focus on web development and design.',
    },
  });

  // Create sample blog posts
  await prisma.post.upsert({
    where: { slug: 'getting-started-with-react' },
    update: {},
    create: {
      title: 'Getting Started with React',
      slug: 'getting-started-with-react',
      content: `# Getting Started with React

React is a powerful JavaScript library for building user interfaces. In this comprehensive guide, we'll explore the fundamentals of React and how to get started building your first application.

## What is React?

React is a declarative, efficient, and flexible JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components".

## Setting Up Your Development Environment

Before we dive into React, let's set up our development environment:

1. **Node.js**: Make sure you have Node.js installed
2. **Create React App**: Use the official Create React App tool
3. **Code Editor**: VS Code is highly recommended

## Your First Component

Here's a simple React component:

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}
\`\`\`

This component accepts a \`props\` object and returns a React element.

## Conclusion

React makes it easy to create interactive UIs. With its component-based architecture, you can build complex applications by composing simple components together.`,
      excerpt: 'Learn the fundamentals of React and how to build your first component-based application.',
      published: true,
      publishedAt: new Date(),
      authorId: user1.id,
    },
  });

  await prisma.post.upsert({
    where: { slug: 'modern-css-techniques' },
    update: {},
    create: {
      title: 'Modern CSS Techniques for 2024',
      slug: 'modern-css-techniques',
      content: `# Modern CSS Techniques for 2024

CSS has evolved significantly over the years, and 2024 brings exciting new features and techniques that make styling more powerful and efficient than ever before.

## Container Queries

Container queries allow you to apply styles based on the size of a container rather than the viewport:

\`\`\`css
@container (min-width: 400px) {
  .card {
    display: flex;
  }
}
\`\`\`

## CSS Grid and Subgrid

CSS Grid has matured, and subgrid provides even more layout possibilities:

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.subgrid {
  display: grid;
  grid-template-columns: subgrid;
}
\`\`\`

## Custom Properties and CSS Functions

Modern CSS custom properties combined with functions like \`clamp()\` provide powerful responsive design capabilities:

\`\`\`css
:root {
  --fluid-text: clamp(1rem, 4vw, 2rem);
}
\`\`\`

## Conclusion

These modern CSS techniques enable us to create more maintainable, responsive, and beautiful web interfaces with less code and better performance.`,
      excerpt: 'Discover the latest CSS techniques and features that will improve your web development workflow in 2024.',
      published: true,
      publishedAt: new Date(),
      authorId: user2.id,
    },
  });

  await prisma.post.upsert({
    where: { slug: 'draft-post-typescript-tips' },
    update: {},
    create: {
      title: 'TypeScript Tips and Tricks',
      slug: 'draft-post-typescript-tips',
      content: `# TypeScript Tips and Tricks

This is a draft post about TypeScript best practices...

(Content in progress)`,
      excerpt: 'A collection of useful TypeScript tips for better development.',
      published: false,
      authorId: user1.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('👤 Created users:', { user1: user1.email, user2: user2.email });
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });