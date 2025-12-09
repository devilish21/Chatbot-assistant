FROM node:20-alpine

# Install dumb-init to handle PID 1 signals correctly
RUN apk add --no-cache dumb-init

WORKDIR /app

# Optimize layer caching: copy deps first
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Use non-root user for security
USER node

EXPOSE 3009

# Use dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Execute directly to avoid shell limitations
CMD ["node", "server.js"]
