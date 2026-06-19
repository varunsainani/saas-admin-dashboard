# Backend container for Back4app Containers (or any Docker host).
FROM node:20-slim

WORKDIR /app

# OpenSSL is required by Prisma's query engine.
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

ENV NODE_ENV=production
EXPOSE 4000

# Apply the schema and seed demo data (both idempotent) on boot, then start.
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss || true; node prisma/seed.js || true; node src/index.js"]
