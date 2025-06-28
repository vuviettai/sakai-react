# syntax = docker/dockerfile:1

FROM node:22-slim AS base

ARG PORT=3000

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Dependencies
FROM base AS dependencies

COPY package*.json ./
RUN npm install

# Build
FROM base AS build

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ARG API_URL=http://127.0.0.1:5001
ENV NEXT_PUBLIC_API_URL=$API_URL
# Public build-time environment variables
# ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

RUN npm run build

# Run
FROM base AS run

ENV NODE_ENV=production
ENV PORT=$PORT

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE $PORT

ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]