# ── Dependencies ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# yarn.lock adalah lockfile yang sinkron dengan package.json
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

# ── Build ─────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* dan rewrites di next.config di-bake saat build,
# jadi nilainya harus diberikan sebagai build arg.
ARG API_BASE_URL=http://backend:8080/api
ARG NEXT_PUBLIC_API_BASE_URL=/api/backend
ENV API_BASE_URL=$API_BASE_URL \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# API_BASE_URL dipakai server-side saat runtime; override lewat env container.
ARG API_BASE_URL=http://backend:8080/api
ENV API_BASE_URL=$API_BASE_URL
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

COPY --from=build --chown=nextjs:nodejs /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
