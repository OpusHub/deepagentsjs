# Build stage
FROM node:18-slim as build

WORKDIR /app

# Copy package files
COPY package.json yarn.lock* ./

# Install Node.js dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN yarn build

# Production stage
FROM node:18-slim

WORKDIR /app

# Install system dependencies for health check
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/examples ./examples

# Install LangGraph CLI for JavaScript/TypeScript
RUN npm install -g @langchain/langgraph-cli

# Copy environment file
COPY .env* ./

# Set working directory to where langgraph.json exists
WORKDIR /app/examples/research

# Expose port (Railway sets PORT environment variable)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Start LangGraph CLI server from the research directory
CMD ["sh", "-c", "npx @langchain/langgraph-cli dev --host 0.0.0.0 --port ${PORT:-8080}"]