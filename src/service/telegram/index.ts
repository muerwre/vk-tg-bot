import { TelegramConfig } from "./types";
import { Telegraf } from "telegraf";
import logger from "../logger";
import { Response } from "express";
import { Update } from "typegram";
import loggerTgMiddleware from "../logger/tg";
import { WebhookConfig } from "../../config/types";

// import SocksProxyAgent from 'socks-proxy-agent';

export class TelegramService {
  public readonly bot: Telegraf;

  constructor(private props: TelegramConfig, private webhook: WebhookConfig) {
    // const agent = (CONFIG.PROXY && new SocksProxyAgent(CONFIG.PROXY)) || null;
    const options: Partial<Telegraf.Options<any>> = {
      telegram: {
        webhookReply: true,
        apiMode: "bot",
        // agent, // TODO: add proxy support
      },
    };

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
        .then(() => this.bot.telegram.setWebhook(this.webhook.url))
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
    const isWebhookEnabled = this.webhook.enabled && this.webhook.url;
    // TODO: test this.webhook.url with axios instead of 'true'
    return isWebhookEnabled && true;
  };
}
