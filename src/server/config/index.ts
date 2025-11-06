import * as dotenv from 'dotenv';
import * as path from 'path';
import { Config } from '../types';

// Load environment variables
dotenv.config();

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development'
  },
  database: {
    path: process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'quiz-game.db')
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    enabled: process.env.REDIS_ENABLED === 'true'
  },
  game: {
    maxPlayers: parseInt(process.env.MAX_PLAYERS || '10', 10),
    questionDuration: parseInt(process.env.QUESTION_DURATION || '15000', 10),
    minPlayers: parseInt(process.env.MIN_PLAYERS || '1', 10)
  },
  features: {
    chat: process.env.ENABLE_CHAT !== 'false',
    sound: process.env.ENABLE_SOUND !== 'false',
    stats: process.env.ENABLE_STATS !== 'false',
    spectatorMode: process.env.ENABLE_SPECTATOR_MODE !== 'false'
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    chatLimitMs: parseInt(process.env.CHAT_RATE_LIMIT_MS || '1000', 10)
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || path.join(process.cwd(), 'logs', 'app.log')
  }
};

export default config;
