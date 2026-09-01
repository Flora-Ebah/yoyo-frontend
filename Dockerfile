# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies (including devDeps for build)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# ---- Build-time args (baked into Next.js client bundle) ----
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_APP_URL
ARG BASEPATH

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_VERSION
ARG NEXT_PUBLIC_API_PATH
ARG NEXT_PUBLIC_SOCKET_URL
ARG NEXT_PUBLIC_API_KEY

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY

ARG NEXT_APP_CONTACT_EMAIL
ARG NEXT_APP_CONTACT_PHONE
ARG NEXT_APP_CONTACT_ADDRESS
ARG NEXT_APP_CONTACT_HOURS
ARG NEXT_APP_CONTACT_SOCIAL_FACEBOOK
ARG NEXT_APP_CONTACT_SOCIAL_LINKEDIN
ARG NEXT_APP_CONTACT_SOCIAL_YOUTUBE

# Export as env so `next build` can read them
ENV NEXT_PUBLIC_APP_TITLE=$NEXT_PUBLIC_APP_TITLE \
    NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    BASEPATH=$BASEPATH \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_API_VERSION=$NEXT_PUBLIC_API_VERSION \
    NEXT_PUBLIC_API_PATH=$NEXT_PUBLIC_API_PATH \
    NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL \
    NEXT_PUBLIC_API_KEY=$NEXT_PUBLIC_API_KEY \
    NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
    NEXT_APP_CONTACT_EMAIL=$NEXT_APP_CONTACT_EMAIL \
    NEXT_APP_CONTACT_PHONE=$NEXT_APP_CONTACT_PHONE \
    NEXT_APP_CONTACT_ADDRESS=$NEXT_APP_CONTACT_ADDRESS \
    NEXT_APP_CONTACT_HOURS=$NEXT_APP_CONTACT_HOURS \
    NEXT_APP_CONTACT_SOCIAL_FACEBOOK=$NEXT_APP_CONTACT_SOCIAL_FACEBOOK \
    NEXT_APP_CONTACT_SOCIAL_LINKEDIN=$NEXT_APP_CONTACT_SOCIAL_LINKEDIN \
    NEXT_APP_CONTACT_SOCIAL_YOUTUBE=$NEXT_APP_CONTACT_SOCIAL_YOUTUBE

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run postinstall-equivalent tasks now that sources exist, then build
RUN yarn build:icons && yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=6001
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy only what is needed to run
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# The runtime user needs a writable image-optimizer cache and yarn cache dir
RUN mkdir -p /app/.next/cache/images /home/nextjs/.cache/yarn \
  && chown -R nextjs:nodejs /app/.next/cache /home/nextjs

USER nextjs
EXPOSE 6001

# Minimal healthcheck endpoint relies on Next.js root route
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/" >/dev/null || exit 1

CMD ["yarn", "start", "-p", "6001", "-H", "0.0.0.0"]
