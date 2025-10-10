# Contributing to Blog App

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8
- Git

### Setting Up Your Development Environment

1. **Fork and Clone**

   ```bash
   git clone https://github.com/YOUR_USERNAME/blog.git
   cd blog
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**

   Copy the example environment files and update them with your values:

   ```bash
   # Root environment (for Docker)
   cp .env.example .env

   # Backend environment
   cp backend/.env.example backend/.env

   # Frontend environment
   cp frontend/.env.example frontend/.env
   ```

4. **Set Up API Keys** (Optional but recommended for full functionality)
   - **Unsplash API**: Get your access key from [https://unsplash.com/developers](https://unsplash.com/developers)
     - Add to `frontend/.env`: `VITE_UNSPLASH_ACCESS_KEY=your-key-here`
   - **Google reCAPTCHA**: Get your keys from [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin)
     - Add to `backend/.env`: `RECAPTCHA_SECRET_KEY=your-secret-key`
     - Add to `frontend/.env`: `VITE_RECAPTCHA_SITE_KEY=your-site-key`
     - For testing, you can use Google's test keys (see .env.example files)

5. **Initialize the Database**

   ```bash
   cd backend
   pnpm db:push
   pnpm db:seed
   cd ..
   ```

6. **Start Development Servers**

   ```bash
   pnpm dev
   ```

   The app will be available at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## Development Workflow

### Branch Naming Convention

- Feature: `feature/description-of-feature`
- Bug fix: `fix/description-of-bug`
- Documentation: `docs/description-of-change`
- Refactoring: `refactor/description-of-change`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example: `feat: add user profile editing functionality`

### Making Changes

1. Create a new branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:

   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

3. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request from your fork to the main repository

## Code Style

### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Running Linters

```bash
# Backend
cd backend
pnpm lint

# Frontend
cd frontend
pnpm lint
```

## Testing

### Running Tests

```bash
# Backend tests
cd backend
pnpm test

# Frontend tests
cd frontend
pnpm test
```

### Writing Tests

- Write tests for new features
- Ensure existing tests pass before submitting PR
- Aim for good test coverage

## Pull Request Process

1. **Update Documentation**: If you're adding new features, update the README.md
2. **Test Thoroughly**: Make sure all tests pass
3. **Describe Changes**: Provide a clear description of what your PR does
4. **Link Issues**: Reference any related issues
5. **Request Review**: Wait for maintainer review
6. **Address Feedback**: Make requested changes promptly

### Pull Request Checklist

- [ ] Code follows the project's style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventional commits
- [ ] No sensitive information (API keys, passwords) in code
- [ ] Branch is up to date with main

## Security

### Reporting Security Issues

If you discover a security vulnerability, please email the maintainers directly instead of opening a public issue.

### Security Best Practices

- Never commit sensitive information (API keys, passwords, tokens)
- Use environment variables for configuration
- Validate all user inputs
- Keep dependencies up to date

## Need Help?

- Check existing [Issues](https://github.com/YOUR_USERNAME/blog/issues)
- Read the [README.md](README.md) and [README.docker.md](README.docker.md)
- Open a new issue with the `question` label

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Welcome newcomers
- Accept constructive criticism gracefully
- Focus on what's best for the community

### Unacceptable Behavior

- Harassment or discrimination of any kind
- Trolling or insulting comments
- Publishing others' private information
- Other unprofessional conduct

Thank you for contributing! 🎉
