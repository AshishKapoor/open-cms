# Copilot Instructions for Blog CMS

## Architecture Overview

This is a full-stack blog application with **separate frontend and backend workspaces** managed by pnpm workspaces. The monorepo structure:

- `/backend` - Express.js + TypeScript API server with Prisma ORM
- `/frontend` - React 18 + Vite SPA with React Router and React Query

**Key architectural principle**: Backend is stateless API with JWT auth; frontend handles all routing and state management via React Context (auth) and React Query (server state).

## Backend Architecture

### Core Flow

1. **Entry**: `src/index.ts` initializes MinIO bucket, then starts Express app
2. **App Setup**: `src/app.ts` configures middleware (helmet, CORS, rate-limiting), routes, and error handling
3. **Authentication**: JWT middleware in `src/middleware/auth.ts` augments `req.user` - protected routes require this
4. **Data**: Prisma client in `src/db/client.ts` manages SQLite/PostgreSQL via schema in `prisma/schema.prisma`

### Critical Patterns

**Error Handling**: Centralized in `src/middleware/errorHandler.ts`

- Catches Zod validation errors and formats as `{ error: "message", details: [{field, message}] }`
- JWT errors return 401; validation errors return 400
- Controllers throw errors; middleware catches and formats responses

**Validation**: All controllers use Zod schemas (e.g., `registerSchema`, `createPostSchema` in `src/controllers/auth.ts` and `src/controllers/posts.ts`)

- Parse request data first: `const validatedData = schema.parse(req.body)`
- Zod errors are caught by error handler automatically

**Routes Structure**: Each route file (`src/routes/*.ts`) has corresponding controller (`src/controllers/*.ts`)

- Routes define OpenAPI/Swagger comments above endpoints for auto-documentation at `/api-docs`
- Controllers have business logic; routes handle middleware chain

**External Services**:

- **reCAPTCHA**: Optional token verification in auth routes via `src/utils/recaptcha.ts`
- **MinIO**: Object storage for image uploads, initialized in `src/index.ts`, used in `src/utils/minio.ts`

### Database Model (Prisma)

```
User (id, email, username, password, firstName, lastName, avatar, bio, isAdmin, createdAt, updatedAt)
  ↓ one-to-many
Post (id, title, slug, content, excerpt, coverImage, published, publishedAt, authorId, createdAt, updatedAt)
  ↓ many-to-many through PostTag
Tag (id, name, slug, description, color, createdAt)
Newsletter (email, createdAt)
```

## Frontend Architecture

### State Management

- **Auth Context** (`src/context/AuthContext.tsx`): Provides `useAuth()` hook - holds `user`, `isAuthenticated`, `isLoading`, login/logout methods. Token stored in localStorage.
- **React Query**: Server state via `src/services/api.ts` - all API calls use axios with auto-token injection

### Routing Pattern

- **React Router** in `src/App.tsx` defines routes; most require `<ProtectedRoute>` wrapper
- Layout wrapper: `src/components/Layout.tsx` for nav/sidebar
- Key pages: `CreatePost.tsx`, `EditPost.tsx`, `PostDetail.tsx`, `Dashboard.tsx` (admin), `Login.tsx`, `Register.tsx`

### API Service Layer

- `src/services/api.ts` exports methods grouped by resource: `authAPI`, `postsAPI`, `tagsAPI`, `newsletterAPI`, `uploadAPI`
- Axios instance auto-injects Bearer token from localStorage on all requests
- Returns typed responses matching `src/types/index.ts`

### Rich Text Editor

- `src/components/TipTapEditor.tsx` wraps TipTap with extensions (markdown, code blocks, tables, etc.)
- Used in post creation/editing with output as HTML

## Developer Workflows

### Local Development

```bash
# Root level - starts both backend and frontend in parallel
pnpm dev

# Individual dev (from root):
pnpm --filter blog-backend dev      # Backend on http://localhost:3000
pnpm --filter blog-frontend dev     # Frontend on http://localhost:5173
```

### Database

```bash
cd backend

# Push schema to database (dev):
pnpm db:push

# Create and apply new migration:
pnpm db:migrate

# Seed database:
pnpm db:seed

# GUI to browse/edit data:
pnpm db:studio
```

### Building & Testing

```bash
# Root level
pnpm build                          # Compile both workspaces
pnpm lint                           # ESLint both workspaces
pnpm type-check                     # TypeScript check both workspaces
pnpm test                           # Run tests (backend Jest, frontend Vitest)

# Type-only check (faster, no build artifacts):
pnpm type-check
```

### Docker Deployment

- `docker-compose.yml` provides PostgreSQL, migration service, and both backend/frontend containers
- Services communicate via `blog-network`; backend connects to DB via `postgresql://blog_user:blog_password@postgres:5432/blog_dev`

## Configuration & Environment

### Backend Config (`src/utils/config.ts`)

- Centralized Zod schema parsing of environment variables
- **Key vars**: `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET` (min 32 chars), `JWT_EXPIRES_IN`
- **External APIs**: `RECAPTCHA_SECRET_KEY`, Unsplash API key in frontend `.env`
- **MinIO**: `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`

### Frontend Config

- `vite.config.ts` for Vite build configuration
- Environment vars accessed via `import.meta.env.VITE_*` prefix required
- `VITE_API_URL` points to backend API

## Project Conventions

### Naming

- **Routes**: Plural resource names (`/api/posts`, `/api/tags`, `/api/newsletter`)
- **Slugs**: Auto-generated from titles for unique URLs (posts, tags)
- **Database IDs**: CUID strings (Prisma default), not UUIDs

### Response Format

- **Success**: `{ success: true, data: {...} }` or resource directly
- **Error**: `{ error: "message", details?: [{field, message}] }`
- **List endpoints**: Return paginated data with `page`, `limit`, `total` metadata

### Code Style

- TypeScript strict mode enabled
- ESLint enforces no unused variables
- Prettier formatting on save recommended
- Type definitions exported from `src/types/index.ts` for frontend

### File Organization

- **Controllers**: Business logic, validation schemas, helper functions
- **Routes**: Endpoint definitions, middleware chains, OpenAPI docs
- **Middleware**: Cross-cutting concerns (auth, error handling)
- **Utils**: Services (config, recaptcha, minio) and shared helpers

## Testing & Quality

### Backend

- Jest configured with TypeScript support
- Controllers are testable; import db client and mock it
- Seed file (`src/db/seed.ts`) shows example data creation

### Frontend

- Vitest with React Testing Library
- Mock API calls via `vi.mock('../services/api')`

## Quick Reference: Adding a Feature

**Example: Adding a new resource endpoint**

1. Update Prisma schema (`prisma/schema.prisma`), run `pnpm db:migrate`
2. Create controller (`src/controllers/resource.ts`) with Zod schemas and handlers
3. Create routes file (`src/routes/resource.ts`) with OpenAPI comments, import controller
4. Register in `src/app.ts`: `app.use('/api/resource', resourceRoutes)`
5. Frontend: Add methods to `src/services/api.ts`, create hooks/components in `src/pages` or `src/components`
6. Add types to `src/types/index.ts`

## Notes for AI Agents

- **Database cascading**: User deletion cascades to posts (see Prisma schema)
- **Admin check**: Use `req.user.isAdmin` in protected routes; define admin-only endpoints early
- **File uploads**: All images go through MinIO via `/api/upload`; returned URL is public CDN path
- **Auth flow**: Token expires in 7 days; frontend should handle 401 responses and redirect to login
- **CORS**: Configured for frontend URL in backend config; update when deploying
