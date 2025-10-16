# Use official Node.js image
FROM node:22-alpine

# Get arguments passed from docker-compose
ARG NODE_ENV
ARG MAX_MEMORY

# Set environment variables
ENV NODE_ENV=${NODE_ENV}
ENV MAX_MEMORY=${MAX_MEMORY}

# Install curl
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN if [ "$NODE_ENV" = "production" ]; then npm install --omit=dev; else npm install; fi

# Bundle app source
COPY . .

# Logs for environment variables
RUN echo "NODE_ENV: $NODE_ENV"
RUN echo "MAX_MEMORY: $MAX_MEMORY"

# Run the app based on the environment
CMD if [ "$NODE_ENV" = "production" ]; then npm start; elif [ "$NODE_ENV" = "development" ]; then npm run dev:server; elif [ "$NODE_ENV" = "local" ]; then npm run dev:local; else echo "Invalid NODE_ENV: $NODE_ENV"; fi