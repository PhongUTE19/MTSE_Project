FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY server.js ./
COPY src ./src

EXPOSE 5000

CMD ["node", "server.js"]
