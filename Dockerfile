# Build the React Client
FROM node:24-alpine AS client-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Build the Express Server
FROM node:24-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ .
RUN npm run build

# Produce the Monolithic Runtime
FROM node:24-alpine
WORKDIR /app

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --from=server-builder /app/server/dist ./dist
COPY --from=server-builder /app/server/src/database/drizzle ./dist/database/drizzle
COPY server/start.sh ./
RUN chmod +x start.sh

COPY --from=client-builder /app/dist ./client-dist

EXPOSE 4000
CMD ["./start.sh"]
