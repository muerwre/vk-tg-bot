FROM node:18-alpine as builder

WORKDIR /app

RUN apk add --no-cache tzdata
COPY ./package.json .
COPY ./yarn.lock .
RUN yarn

COPY . .
RUN yarn build

FROM node:18-alpine AS runner

WORKDIR /app/dist

COPY --from=builder /app/dist ./
COPY --from=builder /app/templates /templates

COPY ./docker/wait-for-it.sh .

EXPOSE 80

CMD ["node", "./index.js"]
