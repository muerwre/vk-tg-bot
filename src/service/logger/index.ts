import { createLogger, format, transports } from "winston";
import prepareConfig from "../../config";

const config = prepareConfig();

const logger = createLogger({
  transports: new transports.Console({
    format: format.simple(),
    level: config.logger?.level || "info",
  }),
});

export default logger;
