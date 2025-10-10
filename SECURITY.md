# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to the maintainers. All security vulnerabilities will be promptly addressed.

**Please do not create public GitHub issues for security vulnerabilities.**

### What to Include

When reporting a vulnerability, please include:

1. A description of the vulnerability
2. Steps to reproduce the issue
3. Potential impact
4. Any suggested fixes (optional)

### Response Time

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity, typically within 30 days

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**: Regularly update all dependencies

   ```bash
   pnpm update
   ```

2. **Use Strong Secrets**:
   - Generate strong JWT secrets (minimum 32 characters)
   - Use secure passwords for database and pgAdmin
   - Never commit `.env` files to git

3. **Environment Variables**: Always use environment variables for sensitive data
   - Database URLs
   - API keys
   - JWT secrets
   - Third-party service credentials

4. **HTTPS in Production**: Always use HTTPS in production environments

5. **Regular Security Audits**: Run security audits regularly
   ```bash
   pnpm audit
   ```

### For Developers

1. **Input Validation**: Always validate and sanitize user inputs
2. **Authentication**: Use proper authentication and authorization
3. **SQL Injection**: Use parameterized queries (Prisma handles this)
4. **XSS Prevention**: Sanitize HTML content
5. **CSRF Protection**: Implement CSRF tokens where needed
6. **Rate Limiting**: Implement rate limiting on API endpoints
7. **Dependency Security**: Keep all dependencies up to date

## Known Security Considerations

### reCAPTCHA Implementation

This project uses Google reCAPTCHA for form protection. Make sure to:

- Use your own reCAPTCHA keys (not test keys) in production
- Keep the secret key secure and never expose it in frontend code

### JWT Authentication

- JWT tokens are stored in localStorage
- Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`)
- Always use strong, randomly generated JWT secrets in production

### Database Access

- Use strong database passwords
- Restrict database access to necessary services only
- Use connection pooling for better security and performance
- Enable SSL/TLS for database connections in production

## Security Updates

Security updates will be released as patch versions and documented in the CHANGELOG.

## Acknowledgments

We appreciate the security research community's efforts in keeping this project secure.
