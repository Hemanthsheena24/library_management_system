# Build stage for frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Install a simple HTTP server
RUN npm install -g http-server

# Copy frontend files
COPY . .

# Production stage - use lightweight image
FROM node:18-alpine

WORKDIR /app

# Copy http-server from builder
RUN npm install -g http-server

# Copy frontend files from builder
COPY --from=builder /app .

# Expose port 8080 (default for http-server)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start the HTTP server
CMD ["http-server", "-p", "8080", "--cors"]
