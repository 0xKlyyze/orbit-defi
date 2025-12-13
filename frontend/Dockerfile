# syntax=docker/dockerfile:1
FROM node:20-slim AS builder
WORKDIR /app

# Copy root manifests and server sources needed for build
COPY package*.json ./
COPY server/tsconfig.json server/tsconfig.json
COPY server/src server/src

# Install dependencies and build the API server
RUN npm ci --legacy-peer-deps \
 && npm run api:build

FROM node:20-slim
ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# Copy compiled server
COPY --from=builder /app/server/dist server/dist

# Cloud Run expects the container to listen on $PORT
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "api:start:prod"]

