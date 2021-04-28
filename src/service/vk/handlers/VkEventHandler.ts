import { NextMiddleware } from "middleware-io";
import { ConfigGroup, GroupInstance, VkEvent } from "../types";
import { VkService } from "../index";
import { TelegramService } from "../../telegram";
import { Template } from "../../template";

export class VkEventHandler {
  public constructor(
    protected type: VkEvent,
    protected group: ConfigGroup,
    protected instance: GroupInstance,
    protected vk: VkService,
    protected telegram: TelegramService,
    protected template: Template<any>
  ) {}

  public execute: (
    context: any,
    next: NextMiddleware
  ) => Promise<void> = async (ctx, next) => {
    console.log(`vk received unknown event`, ctx);
    await next();
  };
}
