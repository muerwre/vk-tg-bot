import { NextMiddleware } from "middleware-io";
import { ConfigGroup, GroupInstance, VkEvent } from "../types";
import { VkService } from "../index";
import { TelegramService } from "../../telegram";
import { Template } from "../../template";

export class VkEventHandler<
  F extends Record<string, any> = any,
  V extends Record<string, any> = any
> {
  public constructor(
    protected type: VkEvent,
    protected group: ConfigGroup,
    protected channel: string,
    protected instance: GroupInstance,
    protected vk: VkService,
    protected telegram: TelegramService,
    protected template: Template<F, V>
  ) {}

  public execute: (
    context: any,
    next: NextMiddleware
  ) => Promise<void> = async (ctx, next) => {
    console.log(`vk received unknown event`, ctx);
    await next();
  };
}
