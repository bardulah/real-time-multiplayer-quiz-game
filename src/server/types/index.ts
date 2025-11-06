// Core type definitions for the quiz game

export interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  answers: PlayerAnswer[];
  isReady: boolean;
  isConnected: boolean;
  disconnectTime?: number;
}

export interface PlayerAnswer {
  questionId: number;
  answerIndex: number;
  isCorrect: boolean;
  answerTime: number;
  pointsEarned: number;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface GameSettings {
  maxPlayers?: number;
  questionCount?: number;
  questionDuration?: number;
  category?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard' | null;
}

export interface GameState {
  gameId: string;
  hostId: string;
  state: 'waiting' | 'playing' | 'finished';
  players: Map<string, Player>;
  currentQuestionIndex: number;
  questions: Question[];
  questionStartTime: number | null;
  chatMessages: ChatMessage[];
  settings: Required<GameSettings>;
  spectators: Set<string>;
}

export interface ChatMessage {
  id: number;
  playerId: string;
  playerName: string;
  avatar: string;
  message: string;
  timestamp: string;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  totalGames: number;
  wins: number;
  totalScore: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  bestScore: number;
  averageScore: number;
  winRate: number;
  accuracy: number;
  fastestAnswer: number | null;
  categoriesPlayed: Record<string, number>;
  difficultiesPlayed: Record<string, number>;
  gamesHistory: GameHistory[];
  lastPlayed: string;
  createdAt: string;
}

export interface GameHistory {
  date: string;
  score: number;
  rank: number;
  correctAnswers: number;
  totalQuestions: number;
  category: string;
  difficulty: string;
}

export interface GameResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  rank: number;
  isWinner: boolean;
  fastestAnswer: number | null;
  category: string;
  difficulty: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
}

export interface SocketEvents {
  // Client to Server
  createGame: (data: { playerName: string; avatar: string; settings: GameSettings }) => void;
  joinGame: (data: { gameId: string; playerName: string; avatar: string }) => void;
  spectateGame: (data: { gameId: string }) => void;
  startGame: (data: { gameId: string }) => void;
  submitAnswer: (data: { gameId: string; answerIndex: number; answerTime: number }) => void;
  chatMessage: (data: { gameId: string; message: string }) => void;
  getStats: (data: { playerId?: string }) => void;
  getLeaderboard: (data: { gameId: string }) => void;
  getGlobalLeaderboard: (data: { metric?: string; limit?: number }) => void;
  reconnect: (data: { gameId: string; playerId: string }) => void;

  // Server to Client
  gameCreated: (data: { gameId: string; playerId: string; gameInfo: any }) => void;
  gameJoined: (data: { gameId: string; playerId: string; gameInfo: any }) => void;
  spectatorJoined: (data: { gameState: any }) => void;
  joinError: (data: { error: string }) => void;
  playerJoined: (data: { player: any; players: any[] }) => void;
  playerLeft: (data: { playerId: string; playerName: string; players: any[] }) => void;
  playerReconnected: (data: { playerId: string; playerName: string; gameState: any }) => void;
  gameStarted: (data: { totalQuestions: number }) => void;
  newQuestion: (data: any) => void;
  answerResult: (data: { isCorrect: boolean; pointsEarned: number; correctAnswer: number }) => void;
  leaderboardUpdate: (data: { leaderboard: LeaderboardEntry[] }) => void;
  gameEnded: (data: any) => void;
  chatMessage: (message: ChatMessage) => void;
  statsUpdated: (data: { stats: PlayerStats }) => void;
  playerStats: (data: { stats: PlayerStats }) => void;
  globalLeaderboard: (data: { leaderboard: any[] }) => void;
  error: (data: { message: string }) => void;
  rateLimitExceeded: (data: { message: string; retryAfter: number }) => void;
}

export interface DatabaseSchema {
  players: {
    id: string;
    name: string;
    createdAt: string;
    lastPlayed: string;
  };

  player_stats: {
    playerId: string;
    totalGames: number;
    wins: number;
    totalScore: number;
    totalCorrectAnswers: number;
    totalQuestions: number;
    bestScore: number;
    averageScore: number;
    winRate: number;
    accuracy: number;
    fastestAnswer: number | null;
    categoriesPlayed: string; // JSON
    difficultiesPlayed: string; // JSON
    updatedAt: string;
  };

  game_history: {
    id: number;
    playerId: string;
    gameDate: string;
    score: number;
    rank: number;
    correctAnswers: number;
    totalQuestions: number;
    category: string;
    difficulty: string;
  };

  questions: {
    id: number;
    question: string;
    options: string; // JSON
    correctAnswer: number;
    category: string;
    difficulty: string;
    points: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Config {
  server: {
    port: number;
    env: string;
  };
  database: {
    path: string;
  };
  redis: {
    host: string;
    port: number;
    enabled: boolean;
  };
  game: {
    maxPlayers: number;
    questionDuration: number;
    minPlayers: number;
  };
  features: {
    chat: boolean;
    sound: boolean;
    stats: boolean;
    spectatorMode: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    chatLimitMs: number;
  };
  cors: {
    origin: string;
  };
  logging: {
    level: string;
    file: string;
  };
}
