FROM node:12-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

ARG NODE_ENV

ENV NODE_ENV=$NODE_ENV

RUN chmod +x ./container_start.sh

EXPOSE 8000

CMD /bin/sh './container_start.sh'