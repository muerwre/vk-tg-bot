import { boolean, object, string } from "yup";
import { httpConfigSchema } from "../api/http/validation";
import { Config } from "./types";
import { vkConfigSchema } from "../service/vk/validation";
import { telegramConfigSchema } from "../service/telegram/validation";
import { loggerConfigSchema } from "../service/logger/config";

const configSchema = object<Config>().required().shape({
  http: httpConfigSchema,
  vk: vkConfigSchema,
  telegram: telegramConfigSchema,
  logger: loggerConfigSchema,
});

export const validateConfig = (config: Config) =>
  configSchema.validateSync(config);
