# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/command-center/package.json apps/command-center/package.json
COPY packages packages
RUN pnpm install --frozen-lockfile

FROM deps AS builder
COPY . .
RUN pnpm --filter @dravik/command-center build

FROM node:22-bookworm-slim AS runner
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs
COPY --from=builder /app/apps/command-center/.next/standalone ./
COPY --from=builder /app/apps/command-center/public ./apps/command-center/public
COPY --from=builder /app/apps/command-center/.next/static ./apps/command-center/.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "apps/command-center/server.js"]
