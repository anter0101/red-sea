FROM node:20-alpine AS builder

WORKDIR /app

# Same pnpm the lockfile and CI use. Corepack otherwise downloads pnpm 12,
# which ignores package.json "pnpm.overrides" and rejects the lockfile.
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

COPY . .
RUN pnpm run build

FROM node:20-alpine AS production

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000
CMD ["node", "dist/main.js"]
