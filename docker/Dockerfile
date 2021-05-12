FROM node:lts-fermium

WORKDIR /app
RUN rm -rf /app/*

COPY ./package.json .
COPY ./yarn.lock .

RUN yarn
COPY . .
RUN yarn build

WORKDIR /app/dist
COPY ./docker/wait-for-it.sh .

EXPOSE ${EXPOSE}
#HEALTHCHECK --interval=5m --timeout=30s CMD curl -f http://localhost/ || kill -s 2 1
CMD ["node", "./index.js"]
