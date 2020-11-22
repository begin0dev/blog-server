import { createLogger, format, transports } from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new WinstonDaily({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: 'logs',
      filename: `%DATE%.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
    new WinstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: 'logs',
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
  silent: process.env.NODE_ENV === 'test',
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({ format: format.combine(format.colorize(), format.simple()) }));
}

export default logger;
