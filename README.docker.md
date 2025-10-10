# Blog App Docker Setup

This project includes Docker configuration for running the blog application in both development and production environments.

## Prerequisites

- Docker
- Docker Compose
- Git

## Quick Start

### Production Deployment

1. **Clone the repository and set up environment:**

   ```bash
   git clone <your-repo-url>
   cd blog
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Edit the `.env` file** with your production values:

   ```bash
   # Change these values for production
   JWT_SECRET=your-very-secure-jwt-secret-here
   CORS_ORIGIN=https://yourdomain.com
   VITE_API_URL=https://api.yourdomain.com/api
   ```

3. **Start the application:**

   ```bash
   docker-compose up -d
   ```

   The system will automatically:
   - Run database migrations first
   - Start the backend service after migrations complete
   - Start the frontend service

4. **Access the application:**
   - Frontend: http://localhost (port 80)
   - Backend API: http://localhost:3000
   - Database: Neon.dev PostgreSQL (external)

### Development Environment

For development with hot reloading:

1. **Start development services:**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

   The system will automatically:
   - Run database migrations first (with `migrate dev`)
   - Start the backend service with hot reloading
   - Start the frontend service with hot reloading

2. **Access the application:**
   - Frontend: http://localhost:5173 (Vite dev server)
   - Backend API: http://localhost:3000
   - Database: Neon.dev PostgreSQL (external)

## Services

### Frontend

- **Technology:** React + Vite + TypeScript
- **Production:** Nginx serving static files
- **Development:** Vite dev server with hot reloading
- **Port:** 80 (production), 5173 (development)

### Backend

- **Technology:** Node.js + Express + TypeScript + Prisma
- **Database:** PostgreSQL
- **Port:** 3000
- **Features:** JWT authentication, API documentation

### Database

- **Technology:** Neon.dev PostgreSQL (Serverless)
- **Location:** External cloud service
- **Features:** Managed PostgreSQL with automatic scaling

## Docker Commands

### Production Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Remove everything including volumes
docker-compose down -v
```

### Development Commands

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop development environment
docker-compose -f docker-compose.dev.yml down

# Rebuild and restart
docker-compose -f docker-compose.dev.yml up -d --build
```

### Database Commands

**Note:** Migrations are now automated and run automatically when starting services.

```bash
# Generate Prisma client (if needed)
docker-compose exec backend pnpm prisma generate

# Open Prisma Studio
docker-compose exec backend pnpm prisma studio

# Seed database (optional)
docker-compose exec backend pnpm db:seed

# Manual migration (if needed)
docker-compose exec backend pnpm prisma migrate deploy

# Reset database (development only)
docker-compose -f docker-compose.dev.yml exec backend pnpm prisma migrate reset

# View migration status
docker-compose exec backend pnpm prisma migrate status
```

### Utility Commands

```bash
# Shell into backend container
docker-compose exec backend sh

# Shell into frontend container
docker-compose exec frontend sh

# View container status
docker-compose ps

# View resource usage
docker stats
```

## File Structure

```
blog/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── .env.example                # Environment variables template
├── .dockerignore               # Root Docker ignore
├── backend/
│   ├── Dockerfile              # Backend container definition
│   ├── .dockerignore           # Backend specific ignores
│   └── ...
├── frontend/
│   ├── Dockerfile              # Frontend container definition
│   ├── .dockerignore           # Frontend specific ignores
│   └── ...
└── README.docker.md            # This file
```

## Environment Variables

### Required Variables

- `JWT_SECRET`: Secret key for JWT token signing
- `CORS_ORIGIN`: Allowed origin for CORS requests
- `VITE_API_URL`: Backend API URL for frontend

### Database Configuration

The application uses PostgreSQL database. You have two options:

1. **Local PostgreSQL (Recommended for open-source)**: The docker-compose files include a PostgreSQL service that runs locally
2. **Cloud PostgreSQL (Neon.dev, AWS RDS, etc.)**: You can configure an external database by setting the `DATABASE_URL` environment variable

For local development, the database is automatically set up when you run `docker-compose up`.

## Security Notes

1. **Change default passwords** in production
2. **Use strong JWT secrets** (at least 32 characters)
3. **Configure proper CORS origins** for your domain
4. **Use HTTPS** in production with a reverse proxy like nginx or Traefik
5. **Keep Docker images updated** regularly

## Troubleshooting

### Common Issues

1. **Port conflicts:**

   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :5173
   ```

2. **Database connection issues:**

   ```bash
   # Check backend logs for database connection errors
   docker-compose logs backend

   # Test database connectivity from backend container
   docker-compose exec backend sh
   # Then inside container: npx prisma db pull
   ```

3. **Build failures:**

   ```bash
   # Clean rebuild
   docker-compose down
   docker system prune -f
   docker-compose build --no-cache
   ```

4. **Permission issues:**
   ```bash
   # Fix volume permissions
   sudo chown -R $USER:$USER ./backend/uploads
   ```

### Performance Tips

1. **Use multi-stage builds** (already implemented)
2. **Optimize Docker images** with Alpine Linux
3. **Use .dockerignore** to reduce build context
4. **Enable BuildKit** for faster builds:
   ```bash
   export DOCKER_BUILDKIT=1
   ```

## Production Deployment

For production deployment, consider:

1. **Reverse Proxy:** Use nginx or Traefik for SSL termination
2. **Environment Variables:** Use Docker secrets or external secret management
3. **Monitoring:** Add health checks and monitoring solutions
4. **Backup:** Implement database backup strategies
5. **Scaling:** Use Docker Swarm or Kubernetes for scaling

## Support

For issues related to the application itself, please refer to the main README.md file. For Docker-specific issues, check the troubleshooting section above or create an issue in the repository.
