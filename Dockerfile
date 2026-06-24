# syntax=docker/dockerfile:1
# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:24-trixie-slim AS builder

WORKDIR /app

# Install deps first (cached layer — only re-runs if package files change)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source (invalidates cache only when source changes)
COPY . .

# Build SvelteKit
RUN npm run build

# ── Stage 2: Runner (distroless nonroot) ──────────────────────────────────────
FROM gcr.io/distroless/nodejs24-debian13:nonroot AS runner

WORKDIR /app

# Copy only the built artefact + needed runtime files
COPY --from=builder --chown=nonroot:nonroot /app/build build
COPY --from=builder --chown=nonroot:nonroot /app/node_modules node_modules
COPY --from=builder --chown=nonroot:nonroot /app/package.json package.json

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER nonroot

CMD ["build/index.js"]
