# Blog App

A modern, full-stack blog application built with industry best practices and open-source technologies.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

<img width="1691" height="1241" alt="Screenshot 2025-09-21 at 10 40 31 PM" src="https://github.com/user-attachments/assets/cf20fa48-a4f2-4cc2-8485-5dba41dcb940" />

> **Note**: This is an open-source project. Feel free to use, modify, and contribute!

## Tech Stack

### Backend

- **Express.js** with TypeScript
- **Prisma ORM** with SQLite (PostgreSQL compatible)
- **JWT Authentication** with bcrypt
- **Input validation** with Zod
- **API documentation** with Swagger/OpenAPI

### Frontend

- **React 18** with TypeScript
- **Vite** with SWC compiler
- **React Router** for navigation
- **React Query/TanStack Query** for state management
- **Tailwind CSS** for styling
- **React Hook Form** with validation

### Development Tools

- **pnpm** package manager
- **ESLint** and **Prettier** for code quality
- **Husky** for git hooks
- **Jest/Vitest** for testing
- **Docker** for containerization

## Features

- 🔐 **User Authentication**: Secure register/login/logout with JWT
- 📝 **Blog Management**: Create, read, update, delete blog posts
- 🏷️ **Tag System**: Organize posts with tags
- 📧 **Newsletter**: Newsletter subscription management
- �️ **Image Integration**: Unsplash photo picker for post covers
- ✏️ **Rich Text Editor**: TipTap editor with markdown support
- 🤖 **Bot Protection**: Google reCAPTCHA integration
- �🔒 **Protected Routes**: Authorization and authentication
- 📱 **Responsive Design**: Mobile-first approach
- ⚡ **Fast Development**: HMR with Vite
- 🧪 **Production Ready**: Docker support
- 📚 **API Documentation**: OpenAPI/Swagger docs

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   # Root environment (for Docker)
   cp .env.example .env

   # Backend environment
   cp backend/.env.example backend/.env

   # Frontend environment
   cp frontend/.env.example frontend/.env
   ```

   **Important**: Update the `.env` files with your own values:
   - Get Unsplash API key from [https://unsplash.com/developers](https://unsplash.com/developers)
   - Get Google reCAPTCHA keys from [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
   - Generate a strong JWT secret (minimum 32 characters)

4. Initialize the database:

   ```bash
   cd backend && pnpm db:push && pnpm db:seed
   ```

5. Start development servers:
   ```bash
   pnpm dev
   ```

The app will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api-docs

## Project Structure

```
blog-app/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── utils/
│   │   └── types/
│   ├── prisma/
│   └── tests/
├── frontend/         # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   └── public/
└── docs/            # Documentation
```

## Development

### Backend Commands

```bash
cd backend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm db:push      # Push schema to database
pnpm db:seed      # Seed database with sample data
```

### Frontend Commands

```bash
cd frontend
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm test         # Run tests
pnpm preview      # Preview production build
```

## API Documentation

The API is documented using OpenAPI/Swagger. Once the backend is running, visit:
http://localhost:3000/api-docs

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Code style and standards
- Submitting pull requests
- Reporting issues

## Security

For security concerns, please review our [Security Policy](SECURITY.md) and report vulnerabilities responsibly.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/), [Express](https://expressjs.com/), and [Prisma](https://www.prisma.io/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)
- Image integration with [Unsplash](https://unsplash.com/)
- Rich text editing powered by [TipTap](https://tiptap.dev/)

## Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 🤝 Contributing code

## Roadmap

- [ ] Comment system
- [ ] Social media sharing
- [ ] Search functionality
- [ ] Categories system
- [ ] User profiles with avatars
- [ ] Post drafts and scheduling
- [ ] Analytics dashboard

---

Made with ❤️ by the open-source community
