import { TelegramConfig, WebhookConfig } from "./types";
import { Telegraf } from "telegraf";
import logger from "../logger";
import { Response } from "express";
import { InputMediaPhoto, Update } from "typegram";
import loggerTgMiddleware from "../logger/tg";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

// import SocksProxyAgent from 'socks-proxy-agent';

const maxMessageAge = 3 * 60e3; // skip messages older than this seconds

export class TelegramService {
  public readonly bot: Telegraf;
  public readonly webhook: WebhookConfig = {};

  constructor(private props: TelegramConfig) {
    // const agent = (CONFIG.PROXY && new SocksProxyAgent(CONFIG.PROXY)) || null;
    const options: Partial<Telegraf.Options<any>> = {
      telegram: {
        webhookReply: true,
        apiMode: "bot",
        // agent, // TODO: add proxy support if they block it
      },
    };

    this.webhook = props.webhook;

    this.bot = new Telegraf(props.key, options);
    this.bot.use(loggerTgMiddleware);

    process.once("SIGINT", () => this.stop("SIGINT"));
    process.once("SIGTERM", () => this.stop("SIGTERM"));
  }

  get isWebhookEnabled() {
    return !!this.webhook.enabled && !!this.webhook.url;
  }
  /**
   * Connects to telegram
   */
  public async start() {
    if (this.isWebhookEnabled) {
      await this.bot.telegram
        .deleteWebhook()
        .then(() => this.bot.telegram.setWebhook(this.webhook.url!))
        .then(async () => {
          const info = await this.bot.telegram.getWebhookInfo();
          if (!info.url) {
            throw new Error(`telegram hasn't set webhook`);
          }

          logger.info(`telegram started webhook at ${this.webhook.url}`);
        });
    } else {
      await this.bot.telegram.deleteWebhook().then(
        () => this.bot.launch(),
        () => this.bot.launch()
      );
    }

    logger.info("telegram service started");
  }

  /**
   * Handles webhook updates
   */
  public async handleUpdate(req: Update, res: Response) {
    return this.bot.handleUpdate(req, res);
  }

  /**
   * Sends simple message to channel
   */
  public sendMessageToChan = async (
    channel: string,
    message: string,
    markdown?: boolean,
    extra?: ExtraReplyMessage
  ) => {
    logger.debug(`sending message "${message}" to chan "${channel}"`);
    return await this.bot.telegram.sendMessage(channel, message, {
      ...extra,
      ...(markdown ? { parse_mode: "Markdown" } : {}),
    });
  };

  /**
   * Sends message with photo to channel
   */
  public sendPhotoToChan = async (
    channel: string,
    caption: string,
    src: string,
    markdown?: boolean,
    extra?: ExtraReplyMessage
  ) => {
    logger.debug(`sending photo message "${caption}" to chan "${channel}"`);
    return await this.bot.telegram.sendPhoto(channel, src, {
      ...extra,
      caption,
      ...(markdown ? { parse_mode: "Markdown" } : {}),
    });
  };

  /**
   * Sends simple message to channel
   */
  public sendPhotoGroupToChan = async (
    channel: string,
    caption: string,
    src: string[],
    extra?: ExtraReplyMessage
  ) => {
    logger.debug(`sending photo message "${caption}" to chan "${channel}"`);
    const group: InputMediaPhoto[] = src.map((media, i) => ({
      type: "photo",
      media,
      caption: i === 0 ? caption : undefined,
    }));

    return await this.bot.telegram.sendMediaGroup(channel, group, {
      ...extra,
    });
  };

  /**
   * Stops service
   * @param signal
   */
  public stop = (signal: string) => {
    try {
      if (this.isWebhookEnabled) {
        return;
      }

      this.bot.stop(signal);
    } finally {
      logger.info("bot gracefully stopped");
    }
  };

  /**
   * Performs healthcheck for telegram
   */
  public healthcheck = async () => {
    try {
      await this.bot.telegram.getMe();
    } catch (e) {
      logger.warn("health check failed at telegram", e);
      throw e;
    }
  };

  /**
   * Checks if user is owner
   */
  public isOwner = (username: string) => {
    return (
      !!username && !!this.props.owners && this.props.owners.includes(username)
    );
  };

  public hears = (
    what: string | RegExp,
    callback: (
      text: string
    ) => string | Promise<string | undefined> | undefined | void
  ) =>
    this.bot.hears(what, async (ctx) => {
      let text: string | void | undefined = "%% not received %%";

      try {
        const age = Date.now() - ctx.message.date * 1000;
        const message = ctx.update.message.text;

        if (age > maxMessageAge) {
          console.warn(
            `skipped message "${message}", since its age ${age / 1000} seconds`
          );

          return;
        }

        text = await callback(message);

        if (!text) {
          return;
        }

        ctx.reply(text, { parse_mode: "MarkdownV2" });
      } catch (error) {
        console.warn(
          `error replying to ${what} (${ctx.update.message.text}) with message "${text}"`,
          error
        );
      }
    });
}
