import { TelegramService } from "../../service/telegram";

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
}
