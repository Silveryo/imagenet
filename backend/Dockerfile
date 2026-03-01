FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["sh", "-c", "bun run db:push && bun run dist/ingest.js /data/structure_released.xml && bun run start"]
