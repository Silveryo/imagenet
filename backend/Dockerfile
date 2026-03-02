FROM oven/bun:1
WORKDIR /app

COPY backend/package.json backend/bun.lock* ./
RUN bun install

COPY backend/ .
# Also copy the data folder so that the ingested XML file is packed within the image.
COPY data/ /data/

RUN bun run build

EXPOSE 3000
CMD ["sh", "-c", "bun run db:push && bun run dist/ingest.js /data/structure_released.xml && bun run start"]
