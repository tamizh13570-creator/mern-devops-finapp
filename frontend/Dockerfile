# ==========================================
# FinApp Frontend Multi-Stage Dockerfile
# ==========================================

# Stage 1: Build React Production Bundle
FROM node:20-alpine AS build

WORKDIR /app

# Copy package definitions
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Argument for API URL (defaults to proxy /api/v1 or localhost:5000)
ARG REACT_APP_API_URL=/api/v1
ENV REACT_APP_API_URL=${REACT_APP_API_URL}

# Build optimized production bundle
RUN npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine

# Remove default nginx html files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
