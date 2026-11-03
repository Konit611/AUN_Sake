# syntax=docker/dockerfile:1

FROM node:24-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# 1) 의존성 설치
FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# 2) 빌드
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# sitemap・canonical・OGP の URL はビルド時に決まる
ARG SITE_URL=http://localhost:3000
ENV SITE_URL=$SITE_URL
RUN npm run build

# 3) 실행
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# output: "standalone" 이 필요한 파일(node_modules 포함)만 .next/standalone 에 모아 준다.
# public 과 .next/static 은 standalone 에 포함되지 않으므로 따로 복사한다.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
