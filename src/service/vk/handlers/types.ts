import { NextMiddleware } from "middleware-io";
import { ConfigGroup } from "../types";

export class VkEventHandler<T = any> {
  public constructor(protected config: ConfigGroup) {}
  public execute: (context: T, next: NextMiddleware) => Promise<void> = async (
    ctx,
    next
  ) => {
    console.log(`vk received unknown event`, ctx);
    await next();
  };
}
