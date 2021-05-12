import { TelegramService } from "../../service/telegram";
import axios from "axios";
import logger from "../../service/logger";

export class TelegramApi {
  constructor(private telegram: TelegramService) {}

  public listen() {
    this.telegram.bot.command("ping", TelegramApi.ping);
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
