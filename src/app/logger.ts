import 'dotenv/config';
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  transports: [new transports.Console()],
  level: process.env['LOG_LEVEL'],
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message, module, method }) => {
      return method !== ''
        ? `[${timestamp}] ${level}(${module} - ${method}): ${message}`
        : `[${timestamp}] ${level}(${module}): ${message}`;
    }),
  ),
  defaultMeta: {
    module: 'App',
    method: '',
  },
});
