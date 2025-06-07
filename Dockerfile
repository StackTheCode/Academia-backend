FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

FROM node:18 AS production

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

# Use environment variable to decide which command to run
CMD ["sh", "-c", "if [ \"$NODE_ENV\" = 'PROD' ]; then npm start; else npm run dev; fi"]