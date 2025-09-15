#!/bin/bash

# Script para criar arquivo .env dinamicamente no Railway
# usando as variáveis de ambiente configuradas no Railway

echo "Creating .env file from Railway environment variables..."

cat > .env << EOF
# Generated from Railway environment variables
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
GOOGLE_API_KEY=${GOOGLE_API_KEY}
TAVILY_API_KEY=${TAVILY_API_KEY}
LANGCHAIN_API_KEY=${LANGCHAIN_API_KEY:-}
LANGCHAIN_TRACING_V2=${LANGCHAIN_TRACING_V2:-true}
LANGCHAIN_PROJECT=${LANGCHAIN_PROJECT:-copy-creator-production}
PORT=${PORT:-8080}
EOF

echo ".env file created successfully!"
echo "Starting LangGraph CLI..."