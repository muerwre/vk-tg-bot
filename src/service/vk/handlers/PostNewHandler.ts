import { VkEventHandler } from "./VkEventHandler";
import { WallPostContext } from "vk-io";
import { NextMiddleware } from "middleware-io";
import { UsersUserFull } from "vk-io/lib/api/schemas/objects";
import { ConfigGroup } from "../types";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  Message,
  Update,
} from "typegram";
import { keys } from "ramda";
import { extractURLs } from "../../../utils/extract";
import logger from "../../logger";
import Composer from "telegraf";
import CallbackQueryUpdate = Update.CallbackQueryUpdate;

type Button = "links" | "likes";
type UrlPrefix = string;
type ExtraGenerator = (
  text: string,
  eventId?: number
) => Promise<InlineKeyboardButton[]>;

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

const PHOTO_CAPTION_LIMIT = 1000;

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

    const exist = await this.getEventById(id);
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

    const parsed = this.themeText(text, user);

    const extras: ExtraReplyMessage = {
      disable_web_page_preview: true,
      reply_markup: await this.createKeyboard(text),
    };

    let msg: Message;

    const images = context.wall.getAttachments("photo");
    const hasThumb =
      this.template.fields.image &&
      images.length &&
      images.some((img) => img.mediumSizeUrl);

    if (hasThumb) {
      const thumb = await images.find((img) => img.mediumSizeUrl);
      msg = await this.telegram.sendPhotoToChan(
        this.channel,
        this.trimTextForPhoto(text, user),
        thumb.mediumSizeUrl,
        extras
      );
    } else {
      msg = await this.telegram.sendMessageToChan(this.channel, parsed, extras);
    }

    const event = await this.createEvent(
      id,
      msg.message_id,
      context.wall.toJSON()
    );
    await this.db.createPost(event.id, context.wall.text);

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
  private createKeyboard = async (
    text: string,
    eventId?: number
  ): Promise<InlineKeyboardMarkup> => {
    const { buttons } = this.template.fields;

    if (!buttons?.length) {
      return;
    }

    const rows = await Promise.all(
      buttons.map((button) => this.extrasGenerators[button](text, eventId))
    );
    const inline_keyboard = rows.filter((el) => el && el.length);

    if (!inline_keyboard.length) {
      return;
    }

    return { inline_keyboard };
  };

  /**
   * Generates link buttons for post
   */
  private generateLinks: ExtraGenerator = async (text) => {
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
  private generateLikes: ExtraGenerator = async (text, eventId) => {
    if (eventId) {
      const event = await this.getEventById(eventId);
      const likes = await this.db.getLikesFor(this.channel, event.tgMessageId);
      const withCount = likes.reduce(
        (acc, like) => ({
          ...acc,
          [like.text]: acc[like.text] ? acc[like.text] + 1 : 1,
        }),
        {} as Record<string, number>
      );

      return this.likes.map((like) => ({
        text: withCount[like] ? `${like} ${withCount[like]}` : like,
        callback_data: `/like ${this.channel} ${like}`,
      }));
    }

    return this.likes.map((like) => ({
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
  private onLikeAction = async (ctx: LikeCtx, next) => {
    const id = ctx.update.callback_query.message.message_id;
    const author = ctx.update.callback_query.from.id;
    const [, channel, emo] = ctx.match;
    const event = await this.getEventByTgMessageId(id);

    if (
      !channel ||
      !emo ||
      !id ||
      !event ||
      channel != this.channel ||
      !this.likes.includes(emo)
    ) {
      await next();
      return;
    }

    const post = await this.db.findPostByEvent(event.id);
    if (!post) {
      await next();
      return;
    }

    const like = await this.getLike(author, id);
    if (like?.text === emo) {
      await next();
      return;
    }

    await this.createOrUpdateLike(author, event.tgMessageId, emo);

    const markup = await this.createKeyboard(post.text, event.id);

    await ctx.telegram.editMessageReplyMarkup(
      ctx.chat.id,
      id,
      ctx.inlineMessageId,
      markup
    );

    logger.info(
      `someone reacted with ${emo} to message ${id} on channel ${channel}`
    );

    next();
  };

  private createOrUpdateLike = async (
    author: number,
    messageId: number,
    emo: string
  ) => {
    return await this.db.createOrUpdateLike(
      messageId,
      this.channel,
      author,
      emo
    );
  };

  private getLike = async (author: number, messageId: number) => {
    return await this.db.getLikeBy(this.channel, messageId, author);
  };

  /**
   * Applies template theming to photos
   */
  private themeText = (text: string, user?: UsersUserFull): string => {
    return this.template.theme({
      user,
      group: this.group,
      text,
    });
  };

  /**
   * Calculates, how much should we cut off the text to match photo caption limitations
   */
  private trimTextForPhoto = (text: string, user: UsersUserFull): string => {
    const withText = this.themeText(text, user);
    const withoutText = this.themeText("", user);

    return withText.slice(0, PHOTO_CAPTION_LIMIT - withoutText.length);
  };
}
