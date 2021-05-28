import { TelegramService } from "../../service/telegram";
import axios from "axios";
import logger from "../../service/logger";
import { PostgresDB } from "../../service/db/postgres";
import { Readable } from "stream";

export class TelegramApi {
  constructor(
    private telegram: TelegramService,
    private db: PostgresDB,
    private config: Record<any, any>
  ) {}

  public listen() {
    this.telegram.bot.command("ping", TelegramApi.ping);
    this.telegram.bot.command("config", this.dumpConfig);
    this.telegram.bot.command("pop", this.pop);
    this.telegram.bot.command("wtf", this.wtf);

    return;
  }

  /**
   * Handles ping command
   */
  private static ping(ctx) {
    return ctx.replyWithSticker(
      "CAACAgIAAxkBAAIB6F82KSeJBEFer895bb7mFI7_GzYoAAISAAOwODIrOXeFNb5v4aEaBA"
    );
  }

  /**
   * Pops last recorded request from vk
   */
  private pop = async (ctx, next) => {
    const username = ctx?.update?.message?.from?.username;

    if (!username || !this.telegram.isOwner(`@${username}`)) {
      return;
    }

    const request = await this.db.popRequest();
    if (!request) {
      await ctx.reply(`sorry, no logged requests yet`);
      return next();
    }

    const { body, createdAt } = request;
    const source = JSON.stringify(body, null, 2);

    await ctx.replyWithDocument(
      {
        source: Readable.from(source),
        filename: `debug-${createdAt.toISOString()}.txt`,
      },
      { caption: `recorded at: ${createdAt.toLocaleString()}` }
    );

    return next();
  };

  /**
   * Pops last recorded request from vk
   */
  private dumpConfig = async (ctx, next) => {
    const username = ctx?.update?.message?.from?.username;

    if (!username || !this.telegram.isOwner(`@${username}`)) {
      return;
    }

    const source = JSON.stringify(this.config, null, 2);
    await ctx.replyWithDocument({
      source: Readable.from(source),
      filename: `config.txt`,
    });

    return next();
  };

  /**
   * Sends recent logs
   */
  private wtf = async (ctx, next) => {
    const username = ctx?.update?.message?.from?.username;

    if (!username || !this.telegram.isOwner(`@${username}`)) {
      return;
    }

    const logs = await this.db.popLogs();
    if (!logs || !logs.length) {
      await ctx.reply(`sorry, no logged errors yet`);
      return next();
    }

    const source = JSON.stringify(logs, null, 2);

    await ctx.replyWithDocument({
      source: Readable.from(source),
      filename: `logs-${new Date().toISOString()}.txt`,
    });

    return next();
  };

  /**
   * Probes webhook url and falls back to polling mode on error
   */
  public probe = async () => {
    if (!this.telegram.isWebhookEnabled) {
      return;
    }

    try {
      await axios.get(this.telegram.webhook.url!);

      logger.info(
        `probing telegram webhook at ${this.telegram.webhook.url}: ok`
      );
    } catch (e) {
      logger.warn(
        `probing telegram webhook at ${this.telegram.webhook.url}: FAILED, falling back to polling mode`
      );
      await this.telegram.bot.launch();
    }
  };
}
