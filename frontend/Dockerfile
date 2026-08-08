# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code frontend
COPY . .

# Build frontend React (Vite)
RUN npm run build

# Stage 2: Serve dengan Nginx
FROM nginx:alpine

# Copy file build ke folder default Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom konfigurasi Nginx untuk handle SPA Router & Proxy API
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port Nginx
EXPOSE 80

# Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]
