import { NextMiddleware } from "middleware-io";
import { ConfigGroup, GroupInstance } from "../types";
import { VkService } from "../index";
import { TelegramService } from "../../telegram";

export abstract class VkEventHandler {
  public constructor(
    protected group: ConfigGroup,
    protected instance: GroupInstance,
    protected vk: VkService,
    protected telegram: TelegramService
  ) {}

  public execute: (
    context: any,
    next: NextMiddleware
  ) => Promise<void> = async (ctx, next) => {
    console.log(`vk received unknown event`, ctx);
    await next();
  };
}
