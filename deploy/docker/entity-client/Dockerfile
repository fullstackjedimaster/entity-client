FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_EC_API_BASE_URL=/api
ARG NEXT_PUBLIC_EC_DEFAULT_JWT=
ARG API_PROXY_TARGET=http://host.docker.internal:8003

ENV NEXT_PUBLIC_EC_API_BASE_URL=${NEXT_PUBLIC_EC_API_BASE_URL}
ENV NEXT_PUBLIC_EC_DEFAULT_JWT=${NEXT_PUBLIC_EC_DEFAULT_JWT}
ENV API_PROXY_TARGET=${API_PROXY_TARGET}

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
