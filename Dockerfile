# Multi-stage Dockerfile for BiliBay monorepo
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.15.9

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

# Production backend image
FROM node:20-alpine AS backend
RUN npm install -g pnpm@8.15.9
WORKDIR /app

# Copy backend build and dependencies
COPY --from=backend-builder /app/apps/backend/dist ./dist
COPY --from=backend-builder /app/apps/backend/package.json ./package.json
COPY --from=backend-builder /app/node_modules ./node_modules

# Create logs directory
RUN mkdir -p logs

EXPOSE 3000
CMD ["pnpm", "start"]

# Production frontend image
FROM nginx:alpine AS frontend
COPY --from=frontend-builder /app/apps/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]