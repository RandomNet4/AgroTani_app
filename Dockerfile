# =====================================================
# Dockerfile - petani_app (Root)
# Gunakan docker-compose.yml untuk menjalankan
# semua service (backend + frontend + db) sekaligus.
#
# File ini untuk build image backend standalone
# jika tidak menggunakan docker-compose.
# =====================================================

# Stage 1: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy dependency backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install semua dependencies (termasuk devDependencies untuk build TS)
RUN npm ci

# Copy source backend
COPY backend/ .

# Build TypeScript → JavaScript
RUN npm run build

# Generate Prisma Client
RUN npx prisma generate

# ─────────────────────────────────────────
# Stage 2: Build Frontend
# ─────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy dependency frontend
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source frontend
COPY frontend/ .

# Build React/Vite → static files
RUN npm run build

# ─────────────────────────────────────────
# Stage 3: Production Backend Runner
# ─────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package.json backend untuk install production deps
COPY backend/package*.json ./

# Install hanya production dependencies
RUN npm ci --only=production

# Copy hasil build backend dari stage builder
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/backend/node_modules/@prisma/client ./node_modules/@prisma/client

# Expose port backend
EXPOSE 5000

# Jalankan backend
CMD ["node", "dist/index.js"]
