import { createLogger, format, transports } from "winston";
import prepareConfig from "../../config";
import { keys } from "ramda";

const config = prepareConfig();

const logger = createLogger({
  transports: new transports.Console(),
  format: format.combine(
    format.timestamp(),
    format.printf(
      ({ timestamp, level, message, ...rest }) =>
        `${timestamp} ${level}: ${message} ` +
        (rest !== undefined && keys(rest).length ? String(rest) : "")
    )
  ),
  level: config.logger?.level || "info",
});

export default logger;
