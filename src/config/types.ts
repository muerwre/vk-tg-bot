import { TelegramConfig } from "../service/telegram/types";
import { VkConfig } from "../service/vk/types";
import { HttpConfig } from "../api/http/types";
import { LoggerConfig } from "../service/logger/types";

export interface Config extends Record<string, any> {
  http: HttpConfig;
  telegram: TelegramConfig;
  vk: VkConfig;
  logger?: LoggerConfig;
}
