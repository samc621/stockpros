FROM node:12-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

ARG ENVIRONMENT

ENV NODE_ENV=$ENVIRONMENT

RUN chmod +x ./container_start.sh

EXPOSE 8000

CMD bash -C './container_start.sh';'bash'