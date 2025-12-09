FROM node:20-slim

# Install system dependencies including dumb-init and python
RUN apt-get update && apt-get install -y --no-install-recommends \
    dumb-init \
    python3 \
    python3-venv \
    python3-pip \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Install Python dependencies in a venv
# Install CPU-only torch to save space and time
RUN python3 -m venv /app/venv && \
    /app/venv/bin/pip install --upgrade pip && \
    /app/venv/bin/pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    /app/venv/bin/pip install --no-cache-dir --timeout 1000 git+https://github.com/Jordan-Jarvis/jenkins-mcp-enterprise

COPY . .

# Fix permissions for the node user
RUN chown -R node:node /app

USER node

EXPOSE 3009

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
