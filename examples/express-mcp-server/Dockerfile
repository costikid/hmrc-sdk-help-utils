FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.33.1

# Copy entire monorepo (needed for workspace resolution)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY examples ./examples

# Install dependencies (no --frozen-lockfile to allow regeneration)
RUN pnpm install

# Build workspace packages
RUN pnpm -r build

# Set working directory to express-mcp-test
WORKDIR /app/examples/express-mcp-test

# Expose port
ENV PORT=3001
EXPOSE 3001

# Start the server
CMD ["pnpm", "start"]
