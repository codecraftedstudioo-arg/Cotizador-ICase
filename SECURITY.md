# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Send an email to the repository owner with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### What to Expect

- Acknowledgment within 48 hours
- Regular updates on the progress
- Credit for the discovery (if desired)

## Security Best Practices

### For Contributors

- Never commit secrets, API keys, or credentials
- Use environment variables for sensitive configuration
- Keep dependencies updated
- Run `npm audit` regularly

### Environment Variables

- Copy `.env.example` to `.env` for local development
- Never commit `.env` files
- Use secure methods to share secrets with team members

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | Yes       |
