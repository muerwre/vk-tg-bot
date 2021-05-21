import { TelegramConfig, WebhookConfig } from "./types";
import { Telegraf } from "telegraf";
import logger from "../logger";
import { Response } from "express";
import { InputMediaPhoto, Update } from "typegram";
import loggerTgMiddleware from "../logger/tg";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

// import SocksProxyAgent from 'socks-proxy-agent';

export class TelegramService {
  public readonly bot: Telegraf;
  public readonly webhook: WebhookConfig = {};

  constructor(private props: TelegramConfig) {
    // const agent = (CONFIG.PROXY && new SocksProxyAgent(CONFIG.PROXY)) || null;
    const options: Partial<Telegraf.Options<any>> = {
      telegram: {
        webhookReply: true,
        apiMode: "bot",
        // agent, // TODO: add proxy support
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
    extra?: ExtraReplyMessage
  ) => {
    logger.debug(`sending message "${message}" to chan "${channel}"`);
    return await this.bot.telegram.sendMessage(channel, message, extra);
  };

  /**
   * Sends message with photo to channel
   */
  public sendPhotoToChan = async (
    channel: string,
    caption: string,
    src: string,
    extra?: ExtraReplyMessage
  ) => {
    logger.debug(`sending photo message "${caption}" to chan "${channel}"`);
    return await this.bot.telegram.sendPhoto(channel, src, {
      ...extra,
      caption,
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
}
