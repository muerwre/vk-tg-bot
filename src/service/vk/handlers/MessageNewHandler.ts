import { VkEventHandler } from "./VkEventHandler";
import { MessageContext } from "vk-io";
import { NextMiddleware } from "middleware-io";
import logger from "../../logger";
import { ContextDefaultState } from "vk-io/lib/structures/contexts/context";

export class MessageNewHandler extends VkEventHandler {
  public execute = async (
    context: MessageContext<ContextDefaultState>,
    next: NextMiddleware
  ) => {
    if (context.isOutbox) {
      await next();
      return;
    }

    const users = await this.instance.api.users.get({
      user_ids: [String(context.senderId)],
    });
    const from = users[0];

    logger.debug(
      `received message from ${from.first_name} ${from.last_name}: ${context.text}`
    );

    const template = this.template.template;
    const fields = this.template.fields;

    await next();
  };
}
