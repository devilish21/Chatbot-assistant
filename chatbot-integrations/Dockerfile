# Use specific version for reproducibility
FROM node:20-alpine

# Install dumb-init to handle PID 1 signals correctly
RUN apk add --no-cache dumb-init

WORKDIR /app

# Optimize layer caching: copy deps first
COPY package*.json ./

# Install only production dependencies if possible, but we need dev for some tools? 
# For now, stick to simple install but ensure we clean cache if needed.
# Since it's a proxy, standard install is fine.
# Install Node.js dependencies
RUN npm ci --only=production

# Install Python and dependencies
RUN apk add --no-cache python3 py3-pip git && \
    python3 -m venv /app/venv && \
    /app/venv/bin/pip install --upgrade pip && \
    /app/venv/bin/pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    /app/venv/bin/pip install --no-cache-dir --timeout 1000 git+https://github.com/Jordan-Jarvis/jenkins-mcp-enterprise

# Copy source
COPY . .

# Use non-root user for security
USER node

EXPOSE 3009

# Use dumb-init
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Execute directly to avoid shell limitations
CMD ["node", "server.js"]
