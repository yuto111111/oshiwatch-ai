FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# npm ci は package-lock.json と完全一致していないと失敗する。
# Windows(ローカル)とLinux(Cloud Build)でプラットフォーム固有の
# optionalDependencies解決が食い違うことがあるため npm install を使う
RUN npm install

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* はビルド時にバンドルへ埋め込まれる
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Cloud Run が注入する $PORT でリッスンする
CMD ["sh", "-c", "PORT=${PORT:-8080} node server.js"]
