import winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import config from '../config';

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.file);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// File format (JSON for easier parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  transports: [
    // Console output
    new winston.transports.Console({
      format: consoleFormat
    }),
    // File output
    new winston.transports.File({
      filename: config.logging.file,
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Error file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Add request logging helper
export function logRequest(method: string, path: string, statusCode: number, duration: number) {
  logger.info('HTTP Request', {
    method,
    path,
    statusCode,
    duration: `${duration}ms`
  });
}

// Add error logging helper
export function logError(error: Error, context?: Record<string, any>) {
  logger.error(error.message, {
    stack: error.stack,
    ...context
  });
}

// Add game event logging
export function logGameEvent(event: string, gameId: string, data?: Record<string, any>) {
  logger.info(`Game Event: ${event}`, {
    gameId,
    ...data
  });
}

export default logger;
