FROM node:18-alpine

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@10.33.1 --activate

WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies without frozen-lockfile enforcement
RUN pnpm install --no-frozen-lockfile

# Build all packages in the monorepo
RUN pnpm -r build

EXPOSE 3000

CMD ["pnpm", "--filter", "express-mcp-test", "start"]
