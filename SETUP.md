# Setup Guide

This guide will help you set up the Blog App on your local machine for development.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Environment Configuration](#environment-configuration)
- [Docker Setup](#docker-setup)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 ([Installation Guide](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/downloads))
- **Docker** (Optional, for containerized setup) ([Download](https://www.docker.com/products/docker-desktop))

Verify your installations:

```bash
node --version  # Should be >= 18.0.0
pnpm --version  # Should be >= 8.0.0
git --version
```

## Quick Start

### Option 1: Local Development (Recommended for beginners)

```bash
# 1. Clone the repository
git clone <repository-url>
cd blog

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 4. Initialize the database
cd backend
pnpm db:push
pnpm db:seed
cd ..

# 5. Start development servers
pnpm dev
```

Your app should now be running:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

### Option 2: Docker Setup

See [Docker Setup](#docker-setup) section below or read [README.docker.md](README.docker.md)

## Detailed Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd blog
```

### 2. Install Dependencies

This project uses pnpm workspaces. Install all dependencies at once:

```bash
pnpm install
```

This will install dependencies for both backend and frontend.

### 3. Environment Configuration

Create environment files from templates:

```bash
# Root environment (used by Docker)
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

Now edit each file with your specific values. See [Environment Configuration](#environment-configuration) below.

### 4. Database Setup

The backend uses Prisma ORM with SQLite for local development:

```bash
cd backend

# Push the schema to create the database
pnpm db:push

# Seed with sample data (optional but recommended)
pnpm db:seed

cd ..
```

### 5. Start Development Servers

From the root directory:

```bash
pnpm dev
```

This will start both frontend and backend concurrently.

Alternatively, start them separately:

```bash
# Terminal 1 - Backend
cd backend
pnpm dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

## Environment Configuration

### Backend Environment (`backend/.env`)

```bash
# Database - SQLite for local development
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Google reCAPTCHA (Optional)
# Get keys from: https://www.google.com/recaptcha/admin
# For testing without real keys, use: 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
```

**Required Changes:**

- `JWT_SECRET`: Generate a strong secret (at least 32 characters)

**Optional (but recommended):**

- `RECAPTCHA_SECRET_KEY`: Get from [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)

### Frontend Environment (`frontend/.env`)

```bash
# API URL
VITE_API_URL=http://localhost:3000

# Google reCAPTCHA Site Key (Optional)
# Get from: https://www.google.com/recaptcha/admin
# For testing without real keys, use: 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
VITE_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"

# Unsplash API (Optional)
# Get from: https://unsplash.com/developers
VITE_UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
```

**Optional (but recommended):**

- `VITE_RECAPTCHA_SITE_KEY`: Get from [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
- `VITE_UNSPLASH_ACCESS_KEY`: Get from [Unsplash Developers](https://unsplash.com/developers)

### Getting API Keys

#### Google reCAPTCHA Keys

1. Visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "+" to create a new site
3. Choose reCAPTCHA v2 "I'm not a robot" Checkbox
4. Add `localhost` to domains
5. Copy the **Site Key** and **Secret Key**
6. Add to your `.env` files

**Testing without keys:** You can use Google's test keys during development:

- Site Key: `6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`
- Secret Key: `6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`

#### Unsplash API Key

1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Click "Register as a developer"
3. Create a new application
4. Copy your **Access Key**
5. Add to `frontend/.env` as `VITE_UNSPLASH_ACCESS_KEY`

**Note:** The app works without Unsplash, but you won't be able to use the photo picker feature.

## Docker Setup

### Development with Docker

```bash
# Start all services (PostgreSQL, Backend, Frontend, pgAdmin)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

Access:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- pgAdmin: http://localhost:8080 (login: admin@example.com / admin)

### Production with Docker

```bash
# Update .env with production values first!
# Then start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access:

- Frontend: http://localhost
- Backend: http://localhost:3000
- pgAdmin: http://localhost:8080

For more Docker details, see [README.docker.md](README.docker.md)

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Check what's using the port (macOS/Linux)
lsof -i :3000  # Backend port
lsof -i :5173  # Frontend port

# Kill the process
kill -9 <PID>
```

### Database Issues

**Reset the database:**

```bash
cd backend
pnpm db:reset  # This will delete all data!
pnpm db:seed   # Re-seed with sample data
```

**Database locked error (SQLite):**

Stop all running processes that might be using the database, then try again.

### Module Not Found Errors

```bash
# Clear and reinstall dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
rm -rf pnpm-lock.yaml
pnpm install
```

### Build Errors

```bash
# Backend
cd backend
pnpm type-check  # Check for TypeScript errors
pnpm lint        # Check for linting issues

# Frontend
cd frontend
pnpm type-check  # Check for TypeScript errors
pnpm lint        # Check for linting issues
```

### Docker Issues

**Containers not starting:**

```bash
# View detailed logs
docker-compose logs

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

**Permission issues with volumes:**

```bash
# Fix volume permissions
sudo chown -R $USER:$USER ./backend/uploads
```

### Environment Variables Not Loading

1. Ensure `.env` files are in the correct locations
2. Restart the development servers
3. Check that variable names match exactly (including `VITE_` prefix for frontend)

### Still Having Issues?

1. Check [existing issues](https://github.com/YOUR_USERNAME/blog/issues) on GitHub
2. Read [CONTRIBUTING.md](CONTRIBUTING.md) for more details
3. Create a new issue with:
   - What you're trying to do
   - What went wrong
   - Error messages
   - Your environment (OS, Node version, etc.)

## Next Steps

- Read [CONTRIBUTING.md](CONTRIBUTING.md) to learn about contributing
- Check out [README.md](README.md) for project overview
- Review [SECURITY.md](SECURITY.md) for security best practices
- Explore [CAPTCHA_SETUP.md](CAPTCHA_SETUP.md) for reCAPTCHA details

Happy coding! 🚀
