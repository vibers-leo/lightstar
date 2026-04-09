FROM node:20-alpine AS base
RUN apk add --no-cache python3 make g++

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Vite 정적 빌드
RUN npm run build
# Express 서버 esbuild 번들
RUN npx esbuild server.ts \
      --bundle \
      --platform=node \
      --format=esm \
      --outfile=dist/server.js \
      --external:sharp \
      --external:fsevents \
      --loader:.ts=ts

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]
