import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import config from '../config';
import logger from '../utils/logger';

let db: Database.Database | null = null;

export function initDatabase(): Database.Database {
  try {
    // Ensure data directory exists
    const dbDir = path.dirname(config.database.path);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      logger.info('Created database directory', { path: dbDir });
    }

    // Initialize database
    db = new Database(config.database.path);
    db.pragma('journal_mode = WAL'); // Better concurrency
    db.pragma('foreign_keys = ON'); // Enforce foreign key constraints

    logger.info('Database initialized', { path: config.database.path });

    // Run migrations
    runMigrations(db);

    return db;
  } catch (error) {
    logger.error('Failed to initialize database', { error });
    throw error;
  }
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    logger.info('Database connection closed');
  }
}

function runMigrations(database: Database.Database): void {
  logger.info('Running database migrations...');

  // Create migrations table
  database.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const migrations = [
    {
      name: '001_initial_schema',
      sql: `
        -- Players table
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          last_played TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- Player stats table
        CREATE TABLE IF NOT EXISTS player_stats (
          player_id TEXT PRIMARY KEY,
          total_games INTEGER NOT NULL DEFAULT 0,
          wins INTEGER NOT NULL DEFAULT 0,
          total_score INTEGER NOT NULL DEFAULT 0,
          total_correct_answers INTEGER NOT NULL DEFAULT 0,
          total_questions INTEGER NOT NULL DEFAULT 0,
          best_score INTEGER NOT NULL DEFAULT 0,
          average_score INTEGER NOT NULL DEFAULT 0,
          win_rate REAL NOT NULL DEFAULT 0,
          accuracy REAL NOT NULL DEFAULT 0,
          fastest_answer INTEGER,
          categories_played TEXT NOT NULL DEFAULT '{}',
          difficulties_played TEXT NOT NULL DEFAULT '{}',
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Game history table
        CREATE TABLE IF NOT EXISTS game_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          player_id TEXT NOT NULL,
          game_date TEXT NOT NULL DEFAULT (datetime('now')),
          score INTEGER NOT NULL,
          rank INTEGER NOT NULL,
          correct_answers INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          category TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
        );

        -- Questions table
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question TEXT NOT NULL,
          options TEXT NOT NULL,
          correct_answer INTEGER NOT NULL,
          category TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          points INTEGER NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        -- Create indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_game_history_player ON game_history(player_id);
        CREATE INDEX IF NOT EXISTS idx_game_history_date ON game_history(game_date DESC);
        CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
        CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
        CREATE INDEX IF NOT EXISTS idx_player_stats_total_score ON player_stats(total_score DESC);
        CREATE INDEX IF NOT EXISTS idx_player_stats_wins ON player_stats(wins DESC);
      `
    }
  ];

  const applied = database.prepare('SELECT name FROM migrations').all() as { name: string }[];
  const appliedNames = new Set(applied.map(m => m.name));

  for (const migration of migrations) {
    if (!appliedNames.has(migration.name)) {
      logger.info(`Applying migration: ${migration.name}`);
      database.exec(migration.sql);
      database.prepare('INSERT INTO migrations (name) VALUES (?)').run(migration.name);
      logger.info(`Migration ${migration.name} applied successfully`);
    }
  }

  logger.info('All migrations completed');
}

export default {
  init: initDatabase,
  get: getDatabase,
  close: closeDatabase
};
