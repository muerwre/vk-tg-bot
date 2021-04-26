import prepareConfig from './config';
import { TelegramService } from './service/telegram';
import logger from './service/logger';
import { VkService } from './service/vk';

try {
  const config = prepareConfig()
  const telegramService = new TelegramService(config.telegram).start()
  const vkService = new VkService(config.vk)

} catch (e) {
  logger.error(e.message)
}
