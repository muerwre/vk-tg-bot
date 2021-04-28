import { VkEventHandler } from "./types";
import { ContextDefaultState, MessageContext } from "vk-io";
import { NextMiddleware } from "middleware-io";

export class MessageNewHandler extends VkEventHandler<
  MessageContext<ContextDefaultState>
> {
  public execute = async (context, next: NextMiddleware) => {
    console.log("received message!");
    await next();
  };
}
