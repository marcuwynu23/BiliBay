# Multi-stage Dockerfile for BiliBay monorepo (single image)
FROM node:20-alpine AS base

# Install pnpm (version 9.x to support lockfileVersion 9.0)
RUN npm install -g pnpm@9

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/ui/package.json ./packages/ui/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build stage for UI library
FROM base AS ui-builder
RUN pnpm --filter @bilibay/ui build

# Build stage for backend
FROM base AS backend-builder
COPY --from=ui-builder /app/packages/ui/dist ./packages/ui/dist
RUN pnpm --filter @bilibay/backend build

# Build stage for frontend
FROM base AS frontend-builder
COPY --from=ui-builder /app/packages/ui/dist ./packages/ui/dist
RUN pnpm --filter @bilibay/frontend build

# Production image (combined frontend and backend)
FROM node:20-alpine AS production

# Install Nginx
RUN apk add --no-cache nginx

# Set working directory
WORKDIR /app

# Copy backend build and dependencies
COPY --from=backend-builder /app/apps/backend/build ./backend
COPY --from=backend-builder /app/node_modules ./node_modules

# Copy frontend build
COPY --from=frontend-builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create logs directory
RUN mkdir -p logs

# Expose ports
EXPOSE 80

# Start script to run both Nginx and backend
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'nginx -g "daemon off;" &' >> /app/start.sh && \
    echo 'cd /app && node backend/index.cjs' >> /app/start.sh && \
    chmod +x /app/start.sh

CMD ["/app/start.sh"]