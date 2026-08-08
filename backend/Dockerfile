# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy file dependency definition
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (termasuk devDependencies untuk build TypeScript)
RUN npm ci

# Copy seluruh source code backend
COPY . .

# Build TypeScript menjadi JavaScript dan generate Prisma Client
RUN npm run build
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Set env ke production
ENV NODE_ENV=production
ENV PORT=5000

# Copy file package.json untuk install dependencies
COPY package*.json ./

# Install hanya dependencies production
RUN npm ci --only=production

# Copy folder hasil build dari stage builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Copy generated Prisma Client agar bisa digunakan tanpa devDependencies
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Expose port backend
EXPOSE 5000

# Jalankan backend
CMD ["npm", "start"]
