import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  transports: new transports.Console({ format: format.simple() })
})

export default logger
