FROM node:lts-fermium

WORKDIR /app

COPY ./package.json .
COPY ./yarn.lock .
RUN yarn

COPY . .
RUN yarn build

WORKDIR /app/dist
COPY ./docker/wait-for-it.sh .

EXPOSE ${EXPOSE}
CMD ["node", "./index.js"]
