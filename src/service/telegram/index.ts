import { TelegramConfig } from "./types";
import { Telegraf } from "telegraf";
import logger from "../logger";
import { Response } from "express";
import { Update } from "typegram";
import loggerTgMiddleware from "../logger/tg";

// import SocksProxyAgent from 'socks-proxy-agent';

export class TelegramService {
  public readonly bot: Telegraf;

  constructor(private props: TelegramConfig) {
    // const agent = (CONFIG.PROXY && new SocksProxyAgent(CONFIG.PROXY)) || null;
    const options = {
      channelMode: true,
      telegram: {
        // agent, // TODO: add proxy support
        webhookReply: !!props.webhookUrl,
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
    await this.bot.telegram.deleteWebhook().then(
      () => this.bot.launch(),
      () => this.bot.launch()
    );

    logger.info("telegram service started");
  }

  /**
   * Handles webhook updates
   */
  public async handleUpdate(req: Update, res: Response) {
    return this.bot.handleUpdate(req, res);
  }
}
