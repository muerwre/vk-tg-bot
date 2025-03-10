import { VkEventHandler } from "./VkEventHandler";
import { WallPostContext } from "vk-io";
import { NextMiddleware } from "middleware-io";
import { UsersUserFull, WallPostType } from "vk-io/lib/api/schemas/objects";
import { ConfigGroup } from "../types";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import {
  InlineKeyboardButton,
  InlineKeyboardMarkup,
  Update,
  User,
} from "typegram";
import { keys } from "lodash";
import { extractURLs } from "../../../utils/links";
import logger from "../../logger";
import Composer from "telegraf";
import { Template } from "../../template";
import { getAttachment } from "../../../utils/attachment";
import CallbackQueryUpdate = Update.CallbackQueryUpdate;

type Button = "links" | "likes" | "more";
type UrlPrefix = string;
type ExtraGenerator = (
  text: string,
  eventId?: number,
  postId?: number
) => Promise<InlineKeyboardButton[] | undefined>;

interface Fields {
  image?: boolean;
  buttons?: Button[];
  link_text?: string;
  links: Record<UrlPrefix, string>;
  likes?: string[];
  char_limit?: number;
  images_limit?: number;
}

interface Values {
  user?: UsersUserFull;
  group: ConfigGroup;
  text: string;
  type?: string;
}

type LikeCtx = Composer.Context<CallbackQueryUpdate> & { match: string[] };

const PHOTO_CAPTION_LIMIT = 1000;
const POST_TEXT_LIMIT = 4096;
const URL_BUTTON_LIMIT = 4;

export class PostNewHandler extends VkEventHandler<Fields, Values> {
  constructor(...props: ConstructorParameters<typeof VkEventHandler<Fields, Values>>) {
    super(...props);
    this.onInit();
  }

  private likes?: string[];

  public execute = async (context: WallPostContext, next: NextMiddleware) => {
    const id = context?.wall?.id;
    const postType = context?.wall?.postType;

    if (context.isRepost || !id) {
      await next();
      return;
    }

    if (!this.isValidPostType(postType)) {
      logger.info(
        `skipping wall_post_new for ${
          this.group.name
        }#${id} since it have type '${postType}', which is not in [${this.channel.post_types.join(
          ","
        )}]`
      );
      await next();
      return;
    }

    const exist = await this.getEventByVkEventId(id);
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

    const text = context.wall?.text?.trim() || "";

    const extras: ExtraReplyMessage = {
      disable_web_page_preview: true,
      reply_markup: await this.createKeyboard(text, undefined, context.wall.id),
    };

    const images = context.wall.getAttachments("photo");
    const thumbs = images
      .map(getAttachment)
      .filter((el) => el)
      .slice(0, this.template.fields.images_limit) as string[];

    const msg = await this.sendMessage(
      text,
      thumbs,
      extras,
      postType,
      user,
      this.channel.markdown
    );

    const event = await this.createEvent(id, msg.message_id, context);

    await this.db.createPost(
      event!.id,
      context?.wall?.text || "",
      context.wall.id
    );

    await next();
  };

  /**
   * Checks if event of type we can handle
   */
  private isValidPostType(type?: string): boolean {
    if (!type) {
      return false;
    }

    if (!this.channel.post_types) {
      return type === "post";
    }

    return this.channel.post_types.includes(type as WallPostType);
  }

  /**
   * Creates extras
   */
  private createKeyboard = async (
    text: string,
    eventId?: number,
    postId?: number
  ): Promise<InlineKeyboardMarkup | undefined> => {
    const { buttons } = this.template.fields;

    if (!buttons?.length) {
      return;
    }

    const rows = await Promise.all(buttons.map((button) =>
      this.extrasGenerators[button](text, eventId, postId)
    ));

    const inline_keyboard = rows.filter(
      (el): el is InlineKeyboardButton[] => Boolean(el && el.length > 0)
    );

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
      return;
    }

    const urls = extractURLs(text);

    if (!urls) {
      return;
    }

    return urls
      .map((url) => {
        const label = keys(links).find((link) =>
          url.toString().startsWith(link)
        );

        return label ? { text: links[label], url: url.toString() } : undefined;
      })
      .slice(0, URL_BUTTON_LIMIT)
      .filter((el) => el) as InlineKeyboardButton[];
  };

  /**
   * Generates read more button
   */
  private generateReadMore: ExtraGenerator = async (text, eventId, postId) => {
    const label = this.template.fields.link_text;

    if (!postId || !label) return [];

    return [{ text: label, url: this.generateVkPostUrl(postId) }];
  };

  /**
   * Generates like button
   */
  private generateLikes: ExtraGenerator = async (text, eventId) => {
    if (!this.likes) return [];

    if (eventId) {
      const event = await this.getEventById(eventId);
      if (!event) {
        throw new Error(`Can't find event`);
      }

      const likes = await this.db.getLikesFor(
        this.channel.id,
        event.tgMessageId
      );

      const withCount = likes.reduce(
        (acc, like) => ({
          ...acc,
          [like.text]: acc[like.text] ? acc[like.text] + 1 : 1,
        }),
        {} as Record<string, number>
      );

      return this.likes.map((like) => ({
        text: withCount[like] ? `${like} ${withCount[like]}` : like,
        callback_data: `/like ${this.channel.id} ${like}`,
      }));
    }

    return this.likes.map((like) => ({
      text: like,
      callback_data: `/like ${this.channel.id} ${like}`,
    }));
  };

  /**
   * Button generators dictionary
   */
  private extrasGenerators: Record<Button, ExtraGenerator> = {
    links: this.generateLinks,
    likes: this.generateLikes,
    more: this.generateReadMore,
  };

  /**
   * Adds needed listeners for telegram
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
    const id = ctx.update.callback_query?.message?.message_id;
    const author = ctx.update.callback_query.from.id;
    const [, channel, emo] = ctx.match;
    const event = await this.getEventByTgMessageId(id);

    if (!event) {
      logger.debug(`event not found for tgMessageId ${id}`);
      await next();
      return;
    }

    if (
      !channel ||
      !emo ||
      !id ||
      channel != this.channel.id ||
      !this.likes?.includes(emo)
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

    const markup = await this.createKeyboard(
      post.text,
      event.id,
      post.vkPostId
    );

    await ctx.telegram.editMessageReplyMarkup(
      ctx.chat?.id,
      id,
      ctx.inlineMessageId,
      markup
    );

    const who = this.getNameFromContext(ctx?.update?.callback_query?.from);
    const short = post.text.slice(0, 10);

    logger.info(
      `${who} reacted with ${emo} to message "${short}..." on channel ${channel}`
    );

    next();
  };

  /**
   * Creates or updates like for {author} on {messageId} with {emo}
   */
  private createOrUpdateLike = async (
    author: number,
    messageId: number,
    emo: string
  ) => {
    return await this.db.createOrUpdateLike(
      messageId,
      this.channel.id,
      author,
      emo
    );
  };

  /**
   * Gets like by {author} on {messageId}
   */
  private getLike = async (author: number, messageId: number) => {
    return await this.db.getLikeBy(this.channel.id, messageId, author);
  };

  /**
   * Applies template theming to photos
   */
  private themeText = (
    text: string,
    type?: string,
    user?: UsersUserFull,
    markdown?: boolean
  ) =>
    this.template.theme(
      {
        user,
        group: this.group,
        type,
        text: Template.cleanText(text, markdown),
      },
      markdown
    );

  /**
   * Calculates, how much should we cut off the text to match photo caption limitations
   */
  private trimTextForPhoto = (
    text: string,
    maxChars: number,
    type?: string,
    user?: UsersUserFull,
    markdown?: boolean
  ) => {
    const withText = this.themeText(text, type, user, markdown);
    const limit = this.template.fields.char_limit
      ? Math.min(this.template.fields.char_limit, maxChars)
      : maxChars;

    if (withText.length < limit) {
      return withText;
    }

    const withoutText = this.themeText("", type, user, markdown);
    const suffix = "...";
    const trimmed = text.slice(0, limit - withoutText.length - suffix.length);

    return this.themeText(`${trimmed}${suffix}`, type, user, markdown);
  };

  /**
   * Generates urls for postId
   */
  generateVkPostUrl = (postId?: number) =>
    `https://vk.com/wall-${this.group.id}_${postId}`;

  /**
   * Returns fullname from user of update callback
   */
  getNameFromContext = (from: User) =>
    [from?.first_name, from?.last_name, from.username && `(@${from.username})`]
      .filter((el) => el)
      .join(" ")
      .trim() || "someone";

  /**
   * Sends message
   */
  sendMessage = async (
    text: string,
    thumbs: string[],
    extras?: ExtraReplyMessage,
    postType?: string,
    user?: UsersUserFull,
    markdown?: boolean
  ) => {
    try {
      const hasThumb =
        !!this.template.fields.image &&
        !!this.template.fields.images_limit &&
        thumbs.length > 0;

      if (hasThumb) {
        const trimmed = this.trimTextForPhoto(
          text,
          PHOTO_CAPTION_LIMIT,
          postType,
          user,
          markdown
        );

        return await this.telegram.sendPhotoToChan(
          this.channel.id,
          trimmed,
          thumbs[0]!,
          markdown,
          extras
        );
      } else {
        const trimmed = this.trimTextForPhoto(
          text,
          POST_TEXT_LIMIT,
          postType,
          user,
          markdown
        );

        return await this.telegram.sendMessageToChan(
          this.channel.id,
          trimmed,
          markdown,
          extras
        );
      }
    } catch (e) {
      if (!markdown) {
        throw e;
      }

      // Try to send as plain text

      logger.warn(
        `telegram: failed to send markdown, falling back to plaintext: ${e}`,
        e
      );

      return this.sendMessage(text, thumbs, extras, postType, user, false);
    }
  };
}
