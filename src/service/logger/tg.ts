import { MiddlewareFn } from "telegraf";
import logger from "./index";

const loggerTgMiddleware: MiddlewareFn<any> = async (ctx, next) => {
  logger.debug(`received tg message`, ctx);
  await next().catch(logger.warn);
};

export default loggerTgMiddleware;
