# Julir Deployment Guide

This document provides comprehensive instructions for deploying the Julir application to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Development](#local-development)
4. [Production Build](#production-build)
5. [Deployment Options](#deployment-options)
   - [Docker Deployment](#docker-deployment)
   - [GitHub Pages](#github-pages)
   - [Vercel](#vercel)
   - [Netlify](#netlify)
   - [AWS S3 + CloudFront](#aws-s3--cloudfront)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Security Considerations](#security-considerations)
8. [Monitoring & Analytics](#monitoring--analytics)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Docker** (optional): For containerized deployment
- **Git**: For version control and CI/CD

### API Keys

Julir can use the following user-provided API keys for full functionality. Enter
them in the Settings panel; do not put them in `VITE_*` environment variables,
because Vite publishes those values in the client bundle. The allowed public
environment variables are listed in [`.env.example`](.env.example).

1. **Google Gemini API Key**: For AI conversations
   - Get it from: [Google AI Studio](https://makersuite.google.com/app/apikey)

2. **Google Cloud Text-to-Speech API Key**: For voice responses
   - Get it from: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Enable the "Cloud Text-to-Speech API"

---

## Environment Configuration

### 1. Create Environment File

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 2. Configure Variables

Edit `.env.local` with your settings:

```env
# Application Configuration
VITE_APP_NAME=Julir
VITE_APP_VERSION=2.0.0

# API Endpoints (default values work out of the box)
VITE_GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
VITE_GOOGLE_TTS_ENDPOINT=https://texttospeech.googleapis.com/v1/text:synthesize

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_DEMO_MODE=false

# Build Configuration
VITE_BASE_URL=/
```

### Environment Files Priority

Vite loads environment files in this order (highest priority first):

1. `.env.local` - Local overrides (never committed)
2. `.env.[mode].local` - Mode-specific local overrides
3. `.env.[mode]` - Mode-specific settings
4. `.env` - Default settings

---

## Local Development

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Run Tests

```bash
# Watch mode
npm test

# Single run
npm run test:run

# With coverage
npm run test:coverage
```

### Type Checking

```bash
npm run typecheck
```

---

## Production Build

### Build the Application

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Build Output

```
dist/
├── assets/
│   ├── css/
│   │   └── index-[hash].css
│   ├── js/
│   │   ├── index-[hash].js
│   │   ├── react-vendor-[hash].js
│   │   └── icons-[hash].js
│   └── images/
├── index.html
└── manifest.json
```

---

## Deployment Options

### Docker Deployment

#### Build Docker Image

```bash
# Build with default settings
npm run docker:build

# Or with custom build args
docker build \
  --build-arg VITE_APP_VERSION=2.0.0 \
  --build-arg VITE_ENABLE_ANALYTICS=true \
  -t julir-app .
```

#### Run Container

```bash
# Using npm script
npm run docker:run

# Or directly
docker run -d -p 80:80 --name julir julir-app
```

#### Docker Compose

```bash
# Production
docker-compose up -d

# Development
docker-compose --profile dev up
```

#### Environment Variables with Docker

```bash
docker run -d -p 80:80 \
  -e VITE_APP_NAME="My Julir" \
  -e VITE_ENABLE_ANALYTICS=true \
  julir-app
```

### GitHub Pages

The CI/CD pipeline automatically deploys to GitHub Pages on push to `main`.

#### Manual Deployment

1. Ensure your repository has GitHub Pages enabled
2. Set the source to "GitHub Actions"
3. Push to the `main` branch

The app will be available at: `https://[username].github.io/[repo-name]/`

#### Configure Base URL

For GitHub Pages subdirectory deployment, set in `.env.production`:

```env
VITE_BASE_URL=/julir-app/
```

### Vercel

#### Automatic Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy!

#### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### vercel.json Configuration

Create `vercel.json` in the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### Netlify

#### Automatic Deployment

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables

#### netlify.toml Configuration

Create `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### AWS S3 + CloudFront

#### 1. Create S3 Bucket

```bash
aws s3 mb s3://julir-app --region us-east-1
```

#### 2. Configure Static Website Hosting

```bash
aws s3 website s3://julir-app \
  --index-document index.html \
  --error-document index.html
```

#### 3. Upload Build

```bash
npm run build
aws s3 sync dist/ s3://julir-app --delete
```

#### 4. Create CloudFront Distribution

Use the AWS Console or CLI to create a distribution pointing to your S3 bucket.

---

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that:

1. **Lint & Type Check**: Validates code quality
2. **Test**: Runs the test suite with coverage
3. **Build**: Creates production build
4. **Docker**: Builds and pushes Docker image to GHCR
5. **Deploy**: Deploys to GitHub Pages
6. **Security**: Runs `npm audit --audit-level=high`; high-severity findings fail the job, and the build waits for this check to pass

### Required Secrets

Configure these in GitHub repository settings:

| Secret | Description |
|--------|-------------|
| `GITHUB_TOKEN` | Automatic (for GHCR and Pages) |

### Branch Protection

Recommended branch protection rules for `main`:

- Require pull request reviews
- Require status checks to pass (lint, test, security, build)
- Require branches to be up to date

---

## Security Considerations

### API Key Management

**Important**: API keys should NEVER be committed to version control or passed
to the public Vite build. Use the Settings panel for user-provided keys, or a
server-side proxy for shared production keys.

#### User-Provided Keys (Recommended)

By default, Julir prompts users to enter their own API keys in the Settings panel. Keys are stored in browser localStorage.

#### Server-Side Proxy (Most Secure)

For production deployments with shared API keys:

1. Create a backend proxy server
2. Store API keys server-side
3. Update API endpoints to point to your proxy

```env
VITE_GEMINI_API_ENDPOINT=https://your-api.example.com/gemini
VITE_GOOGLE_TTS_ENDPOINT=https://your-api.example.com/tts
```

### Security Headers

The nginx configuration includes these security headers:

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: ...`

### HTTPS

Always use HTTPS in production. Most hosting platforms provide automatic SSL/TLS.

---

## Monitoring & Analytics

### Enable Analytics

Set in your environment:

```env
VITE_ENABLE_ANALYTICS=true
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Error Tracking (Sentry)

```env
VITE_ENABLE_ERROR_TRACKING=true
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Health Check

The nginx configuration includes a `/health` endpoint for monitoring:

```bash
curl https://your-domain.com/health
# Returns: healthy
```

---

## Troubleshooting

### Build Fails with TypeScript Errors

```bash
# Check for type errors
npm run typecheck

# Clear cache and rebuild
npm run clean
npm install
npm run build
```

### Docker Build Issues

```bash
# Clear Docker cache
docker builder prune

# Rebuild without cache
docker build --no-cache -t julir-app .
```

### Environment Variables Not Working

1. Ensure public client variables are prefixed with `VITE_`; never prefix API keys
2. Restart the dev server after changes
3. For production, rebuild the application

### API Calls Failing

1. Check browser console for CORS errors
2. Verify API keys are valid
3. Check if API quotas are exceeded
4. Ensure API endpoints are correct

### Speech Recognition Not Working

- Requires HTTPS in production (except localhost)
- Requires browser permission for microphone
- Check browser compatibility (Chrome/Edge recommended)

---

## Quick Reference

### npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript check |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker container |

### Important Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment variable template |
| `Dockerfile` | Container build configuration |
| `docker-compose.yml` | Multi-container setup |
| `nginx.conf` | Production web server config |
| `vite.config.ts` | Build configuration |
| `.github/workflows/ci-cd.yml` | CI/CD pipeline |

---

## Support

For issues and feature requests, please open an issue on GitHub.

**Version**: 2.0.0
**Last Updated**: December 2025
