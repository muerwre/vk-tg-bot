FROM node:18-bookworm as builder

WORKDIR /app

RUN apt update && apt install tzdata -y
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn

COPY . .
RUN yarn build

WORKDIR /app/dist
COPY ./docker/wait-for-it.sh .
EXPOSE 80

CMD ["node", "./index.js"]
