FROM node:20-slim

# Install fabric-ai CLI using official installer and download patterns
RUN apt-get update && \
    apt-get install -y curl git && \
    rm -rf /var/lib/apt/lists/* && \
    curl -fsSL https://raw.githubusercontent.com/danielmiessler/fabric/main/scripts/installer/install.sh | bash && \
    mv /root/.local/bin/fabric /usr/local/bin/fabric && \
    chmod +x /usr/local/bin/fabric && \
    ln -s /usr/local/bin/fabric /usr/local/bin/fabric-ai && \
    # Download patterns using git clone
    mkdir -p /usr/share/fabric && \
    git clone --depth 1 https://github.com/danielmiessler/fabric.git /tmp/fabric-repo && \
    # Copy patterns from data/patterns directory (correct location in repo)
    cp -r /tmp/fabric-repo/data/patterns /usr/share/fabric/ && \
    rm -rf /tmp/fabric-repo && \
    chmod -R 755 /usr/share/fabric

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Remove devDependencies for production
RUN npm prune --production

# Set production environment
ENV NODE_ENV=production

# Set permissions - use existing 'node' user (UID 1000) from base image
RUN chown -R node:node /app

USER node

CMD ["node", "dist/index.js"]
