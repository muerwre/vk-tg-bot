import { object, string } from "yup";
import { httpConfigSchema } from "../api/http/validation";
import { Config } from "./types";
import { vkConfigSchema } from "../service/vk/validation";
import { telegramConfigSchema } from "../service/telegram/validation";
import { loggerConfigSchema } from "../service/logger/config";
import { dbConfigValidatior } from "../service/db/postgres/validation";

export const templateConfigSchema = object().required().shape({
  message_new: string().required(),
  wall_post_new: string().required(),
  group_join: string().required(),
  group_leave: string().required(),
  help: string().optional(),
  help_admin: string().optional(),
});

export const templateOptionalSchema = object().shape({
  message_new: string(),
  wall_post_new: string(),
  group_join: string(),
  group_leave: string(),
});

const configSchema = object<Config>().required().shape({
  http: httpConfigSchema,
  vk: vkConfigSchema,
  telegram: telegramConfigSchema,
  logger: loggerConfigSchema,
  templates: templateConfigSchema,
  postgres: dbConfigValidatior,
});

export const validateConfig = (config: Config) =>
  configSchema.validateSync(config);
