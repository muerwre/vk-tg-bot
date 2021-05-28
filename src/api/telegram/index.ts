import { TelegramService } from "../../service/telegram";
import axios from "axios";
import logger from "../../service/logger";
import { PostgresDB } from "../../service/db/postgres";
import { Readable } from "stream";

export class TelegramApi {
  constructor(private telegram: TelegramService, private db: PostgresDB) {}

  public listen() {
    this.telegram.bot.command("ping", TelegramApi.ping);
    this.telegram.bot.command("pop", this.pop);
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

    const { body, createdAt } = await this.db.popRequest();
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
