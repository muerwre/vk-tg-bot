import { VkEventHandler } from "./VkEventHandler";
import { WallPostContext } from "vk-io";
import { NextMiddleware } from "middleware-io";
import { UsersUserFull } from "vk-io/lib/api/schemas/objects";
import { ConfigGroup } from "../types";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { InlineKeyboardButton, Update } from "typegram";
import { keys } from "ramda";
import { extractURLs } from "../../../utils/extract";
import logger from "../../logger";
import Composer from "telegraf";
import CallbackQueryUpdate = Update.CallbackQueryUpdate;

type Button = "links" | "likes";
type UrlPrefix = string;
type ExtraGenerator = (text: string) => InlineKeyboardButton[];

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

type LikeCtx = Composer.Context<CallbackQueryUpdate> & { match: string[] };

export class PostNewHandler extends VkEventHandler<Fields, Values> {
  constructor(...props: any) {
    // @ts-ignore
    super(...props);
    this.onInit();
  }

  private likes: string[] = ["👎", "👍"];

  public execute = async (context: WallPostContext, next: NextMiddleware) => {
    const id = context?.wall?.id;

    if (
      context.isRepost ||
      !PostNewHandler.isValidPostType(context?.wall?.postType) ||
      !id
    ) {
      await next();
      return;
    }

    const exist = await this.getEventFromDB(id);
    if (exist) {
      logger.warn(
        `received duplicate entry for ${this.group.name}, ${this.type}, ${id}`
      );
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

    const msg = await this.telegram.sendMessageToChan(
      this.channel,
      parsed,
      extras
    );

    await this.storeInDB(id, msg.message_id);

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
    return this.likes.map((like, i) => ({
      text: like,
      callback_data: `/like ${this.channel} ${like}`,
    }));
  };

  /**
   * Button generators dictionary
   */
  private extrasGenerators: Record<Button, ExtraGenerator> = {
    links: this.generateLinks,
    likes: this.generateLikes,
  };

  /**
   * Adds needed listeners
   */
  protected onInit = () => {
    if (this.template.fields.likes) {
      this.likes = this.template.fields.likes;
    }

    if (!this.template.fields.buttons?.includes("likes")) {
      return;
    }

    this.telegram.bot.action(/like (.*) (.*)/, this.onLikeAction);
  };

  /**
   * Reacts to like button press
   */
  onLikeAction = async (ctx: LikeCtx, next) => {
    const id = ctx.update.callback_query.message.message_id;
    const [_, channel, emo] = ctx.match;

    if (
      !channel ||
      !emo ||
      !id ||
      channel != this.channel ||
      !this.likes.includes(emo)
    ) {
      await next();
      return;
    }

    logger.warn(
      `someone reacted with ${emo} to message ${id} on channel ${channel}`
    );
  };
}
