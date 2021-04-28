import { VkEventHandler } from "./VkEventHandler";
import { NextMiddleware } from "middleware-io";
import logger from "../../logger";

/**
 * StubHandler is used to stub event calls
 */
export class StubHandler extends VkEventHandler {
  public execute = async (context: any, next: NextMiddleware) => {
    logger.debug(`received unhandled message of type "${context.type}"`);
    await next();
  };
}
