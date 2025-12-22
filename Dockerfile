# ============================================
# JULIR APPLICATION DOCKERFILE
# Multi-stage build for optimized production image
# ============================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_APP_NAME=Julir
ARG VITE_APP_VERSION=2.0.0
ARG VITE_APP_DESCRIPTION="Your voice companion for daily reflections"
ARG VITE_GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent
ARG VITE_GOOGLE_TTS_ENDPOINT=https://texttospeech.googleapis.com/v1/text:synthesize
ARG VITE_ENABLE_ANALYTICS=false
ARG VITE_BASE_URL=/

# Set environment variables for build
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_APP_DESCRIPTION=$VITE_APP_DESCRIPTION
ENV VITE_GEMINI_API_ENDPOINT=$VITE_GEMINI_API_ENDPOINT
ENV VITE_GOOGLE_TTS_ENDPOINT=$VITE_GOOGLE_TTS_ENDPOINT
ENV VITE_ENABLE_ANALYTICS=$VITE_ENABLE_ANALYTICS
ENV VITE_BASE_URL=$VITE_BASE_URL

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add non-root user for security
RUN addgroup -g 1001 -S julir && \
    adduser -S julir -u 1001 -G julir && \
    chown -R julir:julir /usr/share/nginx/html && \
    chown -R julir:julir /var/cache/nginx && \
    chown -R julir:julir /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R julir:julir /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
