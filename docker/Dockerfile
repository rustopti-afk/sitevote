# Stage 1: Base
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Stage 2: Install ALL dependencies (including devDeps needed for build)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Stage 3: Build
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 4: Runner (root user for VPS compatibility)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
