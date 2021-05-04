import { object, string } from "yup";
import { httpConfigSchema } from "../api/http/validation";
import { Config } from "./types";
import { vkConfigSchema } from "../service/vk/validation";
import { telegramConfigSchema } from "../service/telegram/validation";
import { loggerConfigSchema } from "../service/logger/config";
import { dbConfigValidatior } from "../service/db/postgres/validation";

const templateConfigSchema = object().shape({
  message_new: string().required(),
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
