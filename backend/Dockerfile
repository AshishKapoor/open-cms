# Use Node.js 20 LTS Alpine for smaller image size
FROM node:20-alpine AS base

# Install required packages including OpenSSL
RUN apk add --no-cache openssl

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package manager files for workspace
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY backend/package.json ./backend/

# Install dependencies for the entire workspace
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development
WORKDIR /app

# Copy backend source code
COPY backend/ ./backend/

# Generate Prisma client
WORKDIR /app/backend
RUN pnpm prisma generate

# Expose port
EXPOSE 3000

# Start development server
CMD ["pnpm", "dev"]

# Build stage
FROM base AS build
WORKDIR /app

# Copy backend source code
COPY backend/ ./backend/

# Generate Prisma client and build
WORKDIR /app/backend
RUN pnpm prisma generate && pnpm build

# Production stage
FROM node:20-alpine AS production

# Install required packages including OpenSSL
RUN apk add --no-cache openssl

# Install pnpm
RUN npm install -g pnpm

# Create app directory and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

WORKDIR /app

# Copy package files for workspace
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/pnpm-lock.yaml ./
COPY --from=build /app/backend/package.json ./backend/

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built application and prisma files
COPY --from=build --chown=nextjs:nodejs /app/backend/dist ./backend/dist
COPY --from=build --chown=nextjs:nodejs /app/backend/prisma ./backend/prisma

# Generate Prisma client before switching users
WORKDIR /app/backend
RUN pnpm prisma generate

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('https://blog.sannty.in/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["pnpm", "start"]