import { MiddlewareFn } from "telegraf";
import logger from "./index";

const loggerTgMiddleware: MiddlewareFn<any> = async (ctx, next) => {
  logger.debug(
    `received tg message from @${ctx.message.from.username}: ${ctx.message.text}`
  );
  await next().catch(logger.warn);
};

export default loggerTgMiddleware;
