FROM node:18

ARG LISTEN_PORT=3000

WORKDIR /home/breath-server

RUN npm install -g pnpm

COPY package*.json ./

RUN pnpm i

COPY . .

ENV NODE_PATH=./dist

RUN pnpm run build

RUN NODE_ENV=production

RUN pnpm install
