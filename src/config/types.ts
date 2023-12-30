import { TelegramConfig } from "../service/telegram/types";
import { VkConfig, VkEvent } from "../service/vk/types";
import { HttpConfig } from "../api/http/types";
import { LoggerConfig } from "../service/logger/types";
import { PostgresConfig } from "../service/db/postgres/types";

export type TemplateConfig = Record<VkEvent, string> &
  Partial<Record<"help" | "help_admin", string>>;

export interface Config extends Record<string, any> {
  http: HttpConfig;
  telegram: TelegramConfig;
  vk: VkConfig;
  logger: LoggerConfig;
  templates: TemplateConfig;
  postgres: PostgresConfig;
}
