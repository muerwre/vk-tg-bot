import { VkEventHandler } from "./VkEventHandler";
import { WallPostContext } from "vk-io";
import { NextMiddleware } from "middleware-io";
import { UsersUserFull } from "vk-io/lib/api/schemas/objects";
import { ConfigGroup } from "../types";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

type UrlPrefix = string;

interface Fields {
  image?: boolean;
  buttons?: ("buttons" | "likes")[];
  link_text?: string;
  links: Record<UrlPrefix, string>;
}

interface Values {
  user?: UsersUserFull;
  group: ConfigGroup;
  text: string;
}

export class PostNewHandler extends VkEventHandler<Fields, Values> {
  public execute = async (context: WallPostContext, next: NextMiddleware) => {
    if (
      context.isRepost ||
      !PostNewHandler.isValidPostType(context?.wall?.postType)
    ) {
      await next();
      return;
    }

    const user = context.wall.signerId
      ? await this.getUserByID(String(context.wall.signerId))
      : undefined;

    const text = context.wall.text.trim();

    const parsed = this.template.theme({
      user,
      group: this.group,
      text,
    });

    const extras: ExtraReplyMessage = {
      parse_mode: "Markdown",
    };

    await this.telegram.sendMessageToChan(this.channel, parsed, extras);

    await next();
  };

  /**
   * Checks if event of type we can handle
   */
  public static isValidPostType(type: string): boolean {
    return type === "post";
  }
}
