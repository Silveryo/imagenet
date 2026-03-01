FROM oven/bun:latest as builder
WORKDIR /app

# The context is now the root `.`, so we have access to backend
COPY backend /app/backend
WORKDIR /app/backend
RUN bun install

# Switch to frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/bun.lockb* ./
RUN bun install

COPY frontend ./

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN bun run vite build

FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
