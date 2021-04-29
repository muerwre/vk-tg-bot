import { VkEventHandler } from "./VkEventHandler";
import { WallPostContext } from "vk-io";
import { NextMiddleware } from "middleware-io";
import { UsersUserFull } from "vk-io/lib/api/schemas/objects";
import { ConfigGroup } from "../types";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { InlineKeyboardButton } from "typegram";
import { keys } from "ramda";
import { extractURLs } from "../../../utils/extract";

type Button = "links" | "likes";
type UrlPrefix = string;
type ExtraGenerator = (text: string) => InlineKeyboardButton[];

const defaultLikes = ["👎", "👍"];

interface Fields {
  image?: boolean;
  buttons?: Button[];
  link_text?: string;
  links: Record<UrlPrefix, string>;
  likes?: string[];
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
      disable_web_page_preview: true,
    };

    this.appendExtras(extras, text);

    await this.telegram.sendMessageToChan(this.channel, parsed, extras);

    await next();
  };

  /**
   * Checks if event of type we can handle
   */
  public static isValidPostType(type: string): boolean {
    return type === "post";
  }

  /**
   * Creates extras
   */
  private appendExtras = (extras: ExtraReplyMessage, text: string) => {
    const { buttons } = this.template.fields;
    if (!buttons?.length) {
      return;
    }

    const keyboard = buttons
      .map((button) => this.extrasGenerators[button](text))
      .filter((el) => el && el.length);

    if (!keyboard.length) {
      return;
    }

    extras.reply_markup = {
      inline_keyboard: keyboard,
    };
  };

  /**
   * Generates link buttons for post
   */
  private generateLinks: ExtraGenerator = (text) => {
    const links = this.template.fields.links;

    if (!links) {
      return [];
    }

    const urls = extractURLs(text);

    if (!urls) {
      return [];
    }

    return urls
      .map((url) => {
        const label = keys(links).find((link) =>
          url.toString().startsWith(link)
        );

        return label ? { text: links[label], url: url.toString() } : undefined;
      })
      .filter((el) => el);
  };

  /**
   * Generates like button
   */
  private generateLikes: ExtraGenerator = () => {
    const likes = this.template.fields.likes || defaultLikes;
    return likes.map((like, i) => ({
      text: like,
      callback_data: `/like ${like}`,
    }));
  };

  private extrasGenerators: Record<Button, ExtraGenerator> = {
    links: this.generateLinks,
    likes: this.generateLikes,
  };
}
