# Build stage - prepare assets
FROM node:18-alpine AS builder

WORKDIR /app

# Install http-server
RUN npm install -g http-server

# Copy frontend files
COPY . .

# Production stage - lightweight image
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Install http-server
RUN npm install -g http-server

# Copy frontend files from builder
COPY --from=builder /app .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start the HTTP server with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["http-server", "-p", "8080", "--cors", "--gzip", "false"]
