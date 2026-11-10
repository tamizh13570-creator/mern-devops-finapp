# ==========================================
# FinApp Backend Dockerfile
# ==========================================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install curl for container health check
RUN apk add --no-cache curl

# Copy dependency definitions
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Ensure uploads directory exists with correct permissions
RUN mkdir -p uploads && chmod 777 uploads

# Expose backend port
EXPOSE 5000

# Environment defaults (can be overridden in docker-compose.yml)
ENV PORT=5000 \
    NODE_ENV=production

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

# Start backend server
CMD ["node", "server.js"]
