import { TelegramConfig } from '../service/telegram/types';
import { VkConfig } from '../service/vk/types';
import { HttpConfig } from '../api/http/types';

export interface Config extends Record<string, any>{
  http: HttpConfig
  telegram: TelegramConfig
  vk: VkConfig
}
