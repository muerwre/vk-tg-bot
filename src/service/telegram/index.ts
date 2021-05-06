import { TelegramConfig, WebhookConfig } from "./types";
import { Telegraf } from "telegraf";
import logger from "../logger";
import { Response } from "express";
import { Update } from "typegram";
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

    process.once("SIGINT", () => this.bot.stop("SIGINT"));
    process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
  }

  /**
   * Connects to telegram
   */
  public async start() {
    const isWebhookEnabled = await this.getWebhookAvailable();

    if (isWebhookEnabled) {
      await this.bot.telegram
        .deleteWebhook()
        .then(() => this.bot.telegram.setWebhook(this.webhook.url!))
        .then(async () => {
          const info = await this.bot.telegram.getWebhookInfo();
          if (!info.url) {
            throw new Error(`telegram hasn't set webhook`);
          }

          logger.info(`telegram started webhook at ${this.webhook.url}`);
        })
        .catch(logger.warn);
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
   * Checks webhook availability
   */
  private getWebhookAvailable = async (): Promise<boolean> => {
    const isWebhookEnabled = !!this.webhook.enabled && !!this.webhook.url;
    // TODO: test this.webhook.url with axios instead of 'true'
    return isWebhookEnabled && true;
  };

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
   * Sends simple message to channel
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
}
