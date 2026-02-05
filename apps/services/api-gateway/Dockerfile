FROM node:20-alpine AS builder

WORKDIR /workspace

# Install pnpm and build dependencies
RUN npm install -g pnpm && apk add --no-cache python3 make g++

# Copy everything from monorepo root
COPY . .

# Clean up node_modules if they exist and install dependencies
RUN rm -rf node_modules && pnpm install --frozen-lockfile

# Build using nx
RUN ./node_modules/.bin/nx build api-gateway

# Final stage
FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app

# Copy built dist directory from builder
COPY --from=builder /workspace/dist/apps/services/api-gateway ./

# Copy node_modules from builder
COPY --from=builder /workspace/node_modules ./node_modules

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "main.cjs"]
