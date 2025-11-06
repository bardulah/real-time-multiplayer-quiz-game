import Joi from 'joi';
import { GameSettings } from '../types';

const VALID_AVATARS = ['👤', '👨', '👩', '👦', '👧', '👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🦸', '🦹', '🧙', '🧚', '🧛', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸'];
const VALID_CATEGORIES = ['Science', 'Geography', 'History', 'Technology', 'Sports'];
const VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

export const schemas = {
  createGame: Joi.object({
    playerName: Joi.string().min(1).max(20).required(),
    avatar: Joi.string().valid(...VALID_AVATARS).required(),
    settings: Joi.object({
      maxPlayers: Joi.number().integer().min(2).max(50).optional(),
      questionCount: Joi.number().integer().min(1).max(50).optional(),
      questionDuration: Joi.number().integer().min(5000).max(60000).optional(),
      category: Joi.string().valid(null, '', ...VALID_CATEGORIES).optional(),
      difficulty: Joi.string().valid(null, '', ...VALID_DIFFICULTIES).optional()
    }).optional()
  }),

  joinGame: Joi.object({
    gameId: Joi.string().length(6).uppercase().required(),
    playerName: Joi.string().min(1).max(20).required(),
    avatar: Joi.string().valid(...VALID_AVATARS).required()
  }),

  spectateGame: Joi.object({
    gameId: Joi.string().length(6).uppercase().required()
  }),

  startGame: Joi.object({
    gameId: Joi.string().length(6).uppercase().required()
  }),

  submitAnswer: Joi.object({
    gameId: Joi.string().length(6).uppercase().required(),
    answerIndex: Joi.number().integer().min(0).max(3).required(),
    answerTime: Joi.number().integer().min(0).required()
  }),

  chatMessage: Joi.object({
    gameId: Joi.string().length(6).uppercase().required(),
    message: Joi.string().min(1).max(200).required()
  }),

  getStats: Joi.object({
    playerId: Joi.string().optional()
  }),

  getLeaderboard: Joi.object({
    gameId: Joi.string().length(6).uppercase().required()
  }),

  getGlobalLeaderboard: Joi.object({
    metric: Joi.string().valid('totalScore', 'wins', 'winRate', 'accuracy', 'bestScore', 'totalGames').optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
  }),

  reconnect: Joi.object({
    gameId: Joi.string().length(6).uppercase().required(),
    playerId: Joi.string().required()
  })
};

export function validate<T>(schema: Joi.Schema, data: any): { value: T; error?: Joi.ValidationError } {
  const result = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  return {
    value: result.value as T,
    error: result.error
  };
}

export function sanitizeMessage(message: string): string {
  // Remove any HTML tags
  return message.replace(/<[^>]*>/g, '');
}
