# Multi-stage build for efficient Railway deployment
FROM node:18-slim as build

WORKDIR /app

# Install system dependencies for Python and build tools
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

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

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Create Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install LangGraph CLI and dependencies
RUN pip install --no-cache-dir \
    "langgraph-cli[inmem]>=0.1.0" \
    langchain \
    langchain-anthropic \
    langchain-google-genai \
    langchain-tavily \
    python-dotenv

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/examples ./examples

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
CMD ["sh", "-c", "langgraph dev --host 0.0.0.0 --port ${PORT:-8080}"]