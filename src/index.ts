import prepareConfig from "./config";
import { TelegramService } from "./service/telegram";
import logger from "./service/logger";
import { VkService } from "./service/vk";
import { TelegramApi } from "./api/telegram";
import { HttpApi } from "./api/http";
import { PostgresDB } from "./service/db/postgres";

async function main() {
  try {
    const config = prepareConfig();

    const db = new PostgresDB(config.postgres, config.logger);
    await db.connect();

    const telegram = new TelegramService(config.telegram);
    const vkService = new VkService(config.vk, telegram, config.templates, db);

    const telegramApi = new TelegramApi(telegram, db);
    telegramApi.listen();

    await telegram.start();

    const httpApi = new HttpApi(config.http, telegram, vkService);

    await httpApi.listen();
    await telegramApi.probe();

    logger.info("bot successfully started");
  } catch (e) {
    logger.error(`FATAL EXCEPTION ${e.message}`);
  }
}

main();
