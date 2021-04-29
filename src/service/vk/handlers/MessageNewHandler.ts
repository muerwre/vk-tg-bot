import { VkEventHandler } from "./VkEventHandler";
import { MessageContext } from "vk-io";
import { NextMiddleware } from "middleware-io";
import logger from "../../logger";
import { ContextDefaultState } from "vk-io/lib/structures/contexts/context";
import { UsersUserFull } from "vk-io/lib/api/schemas/objects";

interface Fields {
  buttons: string[];
}

interface Values {
  user: UsersUserFull;
  text: string;
}

export class MessageNewHandler extends VkEventHandler<Fields, Values> {
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

    const parsed = this.template.theme({
      user: from,
      text: context.text,
    });

    await this.telegram.sendMessageToChan(this.channel, parsed).catch(next);

    await next();
  };
}
