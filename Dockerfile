# Use Node.js 20 Alpine as base image
FROM node:20-alpine AS base

# Add metadata
LABEL maintainer="Smart Canteen Team"
LABEL description="Smart Canteen Management System"
LABEL version="1.0"

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

# Add metadata
LABEL maintainer="Smart Canteen Team"
LABEL description="Smart Canteen Management System - Production"
LABEL version="1.0"
LABEL org.opencontainers.image.title="Smart Canteen Management System"
LABEL org.opencontainers.image.description="A modern, full-stack web application for managing canteen operations"
LABEL org.opencontainers.image.vendor="Smart Canteen Team"

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the built application and package files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies and serve
RUN npm install --omit=dev --legacy-peer-deps --force && npm install serve && npm cache clean --force

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port 3000
EXPOSE 3000

# Start the application using npx
CMD ["npx", "serve", "-s", "dist", "-l", "3000"] 