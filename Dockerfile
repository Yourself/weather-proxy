FROM node:18-alpine AS BUILD

WORKDIR /home/weather-proxy

RUN npm install -g pnpm

COPY package*.json ./

RUN pnpm i

COPY . .

ENV NODE_PATH=./dist

RUN pnpm run build && NODE_ENV=production && pnpm install

FROM node:18-alpine AS PRODUCTION

WORKDIR /home/weather-proxy

COPY --from=BUILD /home/weather-proxy/node_modules ./node_modules
COPY --from=BUILD /home/weather-proxy/dist ./dist

CMD ["node", "./dist/index.js"]