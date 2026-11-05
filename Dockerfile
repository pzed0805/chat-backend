
# ==========================================
# Stage 1: Base image
# ==========================================
FROM node:22-bookworm-slim AS base

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*


# ==========================================
# Stage 2: Install all dependencies
# ==========================================
FROM base AS dependencies

COPY package*.json ./

RUN npm ci


# ==========================================
# Stage 3: Build application
# ==========================================
FROM dependencies AS builder

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Compile TypeScript
RUN npm run build


# ==========================================
# Stage 4: Production dependencies
# ==========================================
FROM base AS production-dependencies

COPY package*.json ./

RUN npm ci --omit=dev


# ==========================================
# Stage 5: Production image
# ==========================================
FROM base AS production

ENV NODE_ENV=production

WORKDIR /app

# Install production dependencies
COPY --from=production-dependencies /app/node_modules ./node_modules

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy package metadata
COPY package*.json ./

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# Copy Prisma configuration if present
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Run as non-root user
USER node

EXPOSE 5500

CMD ["node", "dist/server.js"]


# ==========================================
# Stage 6: Database migration image
# ==========================================
FROM builder AS migrate

ENV NODE_ENV=production

CMD ["npx", "prisma", "migrate", "deploy"]
