# ==============================================================================
# MadVerse — Create Beyond Ordinary | Production Multi-Stage Dockerfile
# ==============================================================================

# Stage 1: Build Frontend Assets
FROM node:20-alpine AS frontend-builder
WORKDIR /build/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci || npm install

# Build static bundle with Vite
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Server Runtime
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=8080

# Install backend production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && (npm ci --omit=dev || npm install --omit=dev)

# Copy backend source code
COPY backend/ ./backend/

# Copy compiled frontend distribution from builder stage
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

# Expose server port (8080 standard for Cloud Run / Docker)
EXPOSE 8080

# Health check to ensure zero-downtime rolling deploys
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT}/health || exit 1

# Start the unified Express production server
CMD ["node", "backend/server.js"]
