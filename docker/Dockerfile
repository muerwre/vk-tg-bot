FROM node:lts-fermium

WORKDIR /app
RUN rm -rf /app/*

COPY ./package.json .
COPY ./yarn.lock .

COPY . .
RUN yarn
RUN yarn build

WORKDIR /app/dist
COPY ./docker/wait-for-it.sh .

EXPOSE ${EXPOSE}
CMD ["node", "./index.js"]
