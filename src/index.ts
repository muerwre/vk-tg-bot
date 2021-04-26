import prepareConfig from "./config";
import { TelegramService } from "./service/telegram";
import logger from "./service/logger";
import { VkService } from "./service/vk";
import { TelegramApi } from "./api/telegram";
import { HttpApi } from "./api/http";

async function main() {
  try {
    const config = prepareConfig();
    const telegram = new TelegramService(config.telegram);
    const vkService = new VkService(config.vk);

    const telegramApi = new TelegramApi(telegram).listen();
    await telegram.start();

    const httpApi = new HttpApi(config.http, telegram, vkService).listen();
  } catch (e) {
    logger.error(e.message);
  }
}

main();
