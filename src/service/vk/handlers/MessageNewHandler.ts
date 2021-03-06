import { VkEventHandler } from "./VkEventHandler";
import { MessageContext } from "vk-io";
import { NextMiddleware } from "middleware-io";
import logger from "../../logger";
import { ContextDefaultState } from "vk-io/lib/structures/contexts/context";
import { UsersUserFull } from "vk-io/lib/api/schemas/objects";
import { ConfigGroup } from "../types";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

interface Fields {
  buttons?: "link"[];
  link_text?: string;
}

interface Values {
  user?: UsersUserFull;
  group: ConfigGroup;
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

    const user = await this.getUserByID(String(context.senderId));
    const { first_name = "[unknown]", last_name = "[unknown]" } = user || {};

    logger.info(
      `vk, group ${this.group.name} received message from ${first_name} ${last_name}: "${context.text}"`
    );

    const parsed = this.template.theme(
      {
        user,
        group: this.group,
        text: context?.text || "",
      },
      !!this.channel.markdown
    );

    const extras: ExtraReplyMessage = {
      disable_web_page_preview: true,
    };

    this.appendButtons(extras, user?.id);

    await this.telegram.sendMessageToChan(
      this.channel.id,
      parsed,
      !!this.channel.markdown,
      extras
    );

    await next();
  };

  /**
   * Appending buttons (if needed) by mutating original extras
   */
  private appendButtons = (extras: ExtraReplyMessage, userId?: number) => {
    if (!userId || !this.template?.fields?.buttons?.includes("link")) {
      return;
    }

    const text = this.template?.fields?.link_text || "View dialog";
    const url = this.makeDialogUrl(this.group.id, userId);

    extras.reply_markup = {
      inline_keyboard: [[{ text, url }]],
    };
  };
}
