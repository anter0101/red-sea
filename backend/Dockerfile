FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

COPY . .
RUN pnpm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN corepack enable

COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

EXPOSE 3000
CMD ["node", "dist/main.js"]
