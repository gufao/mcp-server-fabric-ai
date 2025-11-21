# Use Node.js LTS image
FROM node:20-slim

# Install fabric-ai CLI
RUN apt-get update && \
    apt-get install -y curl git && \
    curl -fsSL https://raw.githubusercontent.com/danielmiessler/fabric/main/install.sh | bash && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Set Node environment
ENV NODE_ENV=production

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy TypeScript source
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Create non-root user
RUN useradd -m -u 1000 mcpuser && \
    chown -R mcpuser:mcpuser /app

# Switch to non-root user
USER mcpuser

# Run the server
CMD ["node", "dist/index.js"]
