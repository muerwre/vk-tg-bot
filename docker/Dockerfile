FROM node:lts-fermium

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn

COPY . .
RUN yarn build

WORKDIR /app/dist
COPY ./docker/wait-for-it.sh .

EXPOSE 80

CMD ["node", "./index.js"]
