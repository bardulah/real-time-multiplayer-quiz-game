// Simple database helper using better-sqlite3
// This is JavaScript, not TypeScript - keeping it simple first

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class GameDatabase {
  constructor(dbPath = './data/quiz-game.db') {
    this.dbPath = dbPath;
    this.db = null;
  }

  /**
   * Initialize database and create tables if they don't exist
   */
  init() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✓ Created database directory: ${dir}`);
      }

      // Open database
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      console.log(`✓ Database initialized: ${this.dbPath}`);

      // Create tables
      this.createTables();

      return true;
    } catch (error) {
      console.error('✗ Database initialization failed:', error.message);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  createTables() {
    try {
      // Players table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          last_played TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `);

      // Player stats table
      this.db.exec(`
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
          FOREIGN KEY (player_id) REFERENCES players(id)
        )
      `);

      // Game history table
      this.db.exec(`
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
          FOREIGN KEY (player_id) REFERENCES players(id)
        )
      `);

      // Questions table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question TEXT NOT NULL,
          options TEXT NOT NULL,
          correct_answer INTEGER NOT NULL,
          category TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          points INTEGER NOT NULL
        )
      `);

      // Create indexes
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_game_history_player ON game_history(player_id);
        CREATE INDEX IF NOT EXISTS idx_game_history_date ON game_history(game_date DESC);
        CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
        CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
      `);

      console.log('✓ Database tables created');
    } catch (error) {
      console.error('✗ Table creation failed:', error.message);
      throw error;
    }
  }

  /**
   * Get player stats or create if doesn't exist
   */
  getPlayerStats(playerId, playerName) {
    try {
      // Ensure player exists
      this.ensurePlayerExists(playerId, playerName);

      // Get stats
      const stats = this.db.prepare(`
        SELECT * FROM player_stats WHERE player_id = ?
      `).get(playerId);

      if (!stats) {
        // Initialize stats
        this.db.prepare(`
          INSERT INTO player_stats (player_id) VALUES (?)
        `).run(playerId);
        return this.getPlayerStats(playerId, playerName);
      }

      // Parse JSON fields
      return {
        playerId: stats.player_id,
        playerName,
        totalGames: stats.total_games,
        wins: stats.wins,
        totalScore: stats.total_score,
        totalCorrectAnswers: stats.total_correct_answers,
        totalQuestions: stats.total_questions,
        bestScore: stats.best_score,
        averageScore: stats.average_score,
        winRate: stats.win_rate,
        accuracy: stats.accuracy,
        fastestAnswer: stats.fastest_answer,
        categoriesPlayed: JSON.parse(stats.categories_played),
        difficultiesPlayed: JSON.parse(stats.difficulties_played)
      };
    } catch (error) {
      console.error('✗ Failed to get player stats:', error.message);
      throw error;
    }
  }

  /**
   * Update player stats after a game
   */
  updatePlayerStats(playerId, playerName, gameResult) {
    try {
      const stats = this.getPlayerStats(playerId, playerName);

      // Calculate new values
      const newTotalGames = stats.totalGames + 1;
      const newWins = stats.wins + (gameResult.isWinner ? 1 : 0);
      const newTotalScore = stats.totalScore + gameResult.score;
      const newTotalCorrect = stats.totalCorrectAnswers + gameResult.correctAnswers;
      const newTotalQuestions = stats.totalQuestions + gameResult.totalQuestions;
      const newBestScore = Math.max(stats.bestScore, gameResult.score);
      const newAverageScore = Math.round(newTotalScore / newTotalGames);
      const newWinRate = Math.round((newWins / newTotalGames) * 100);
      const newAccuracy = Math.round((newTotalCorrect / newTotalQuestions) * 100);

      let newFastestAnswer = stats.fastestAnswer;
      if (gameResult.fastestAnswer !== null) {
        if (newFastestAnswer === null || gameResult.fastestAnswer < newFastestAnswer) {
          newFastestAnswer = gameResult.fastestAnswer;
        }
      }

      // Update categories and difficulties
      const categoriesPlayed = { ...stats.categoriesPlayed };
      categoriesPlayed[gameResult.category] = (categoriesPlayed[gameResult.category] || 0) + 1;

      const difficultiesPlayed = { ...stats.difficultiesPlayed };
      difficultiesPlayed[gameResult.difficulty] = (difficultiesPlayed[gameResult.difficulty] || 0) + 1;

      // Update in database
      this.db.prepare(`
        UPDATE player_stats SET
          total_games = ?,
          wins = ?,
          total_score = ?,
          total_correct_answers = ?,
          total_questions = ?,
          best_score = ?,
          average_score = ?,
          win_rate = ?,
          accuracy = ?,
          fastest_answer = ?,
          categories_played = ?,
          difficulties_played = ?,
          updated_at = datetime('now')
        WHERE player_id = ?
      `).run(
        newTotalGames, newWins, newTotalScore, newTotalCorrect, newTotalQuestions,
        newBestScore, newAverageScore, newWinRate, newAccuracy, newFastestAnswer,
        JSON.stringify(categoriesPlayed), JSON.stringify(difficultiesPlayed), playerId
      );

      // Add to game history
      this.db.prepare(`
        INSERT INTO game_history (player_id, score, rank, correct_answers, total_questions, category, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        playerId, gameResult.score, gameResult.rank, gameResult.correctAnswers,
        gameResult.totalQuestions, gameResult.category, gameResult.difficulty
      );

      // Update last played
      this.db.prepare(`
        UPDATE players SET last_played = datetime('now') WHERE id = ?
      `).run(playerId);

      console.log(`✓ Stats updated for player ${playerName}`);
      return this.getPlayerStats(playerId, playerName);
    } catch (error) {
      console.error('✗ Failed to update player stats:', error.message);
      throw error;
    }
  }

  /**
   * Ensure player exists in database
   */
  ensurePlayerExists(playerId, playerName) {
    const exists = this.db.prepare('SELECT 1 FROM players WHERE id = ?').get(playerId);
    if (!exists) {
      this.db.prepare('INSERT INTO players (id, name) VALUES (?, ?)').run(playerId, playerName);
      console.log(`✓ Created player record: ${playerName}`);
    }
  }

  /**
   * Seed questions into database
   */
  seedQuestions(questions) {
    try {
      const count = this.db.prepare('SELECT COUNT(*) as count FROM questions').get();
      if (count.count > 0) {
        console.log('✓ Questions already seeded');
        return;
      }

      const insert = this.db.prepare(`
        INSERT INTO questions (question, options, correct_answer, category, difficulty, points)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const insertMany = this.db.transaction((questions) => {
        for (const q of questions) {
          insert.run(
            q.question,
            JSON.stringify(q.options),
            q.correctAnswer,
            q.category,
            q.difficulty,
            q.points
          );
        }
      });

      insertMany(questions);
      console.log(`✓ Seeded ${questions.length} questions`);
    } catch (error) {
      console.error('✗ Failed to seed questions:', error.message);
      throw error;
    }
  }

  /**
   * Get questions from database
   */
  getQuestions(count = 10, difficulty = null, category = null) {
    try {
      let query = 'SELECT * FROM questions WHERE 1=1';
      const params = [];

      if (difficulty) {
        query += ' AND difficulty = ?';
        params.push(difficulty);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY RANDOM() LIMIT ?';
      params.push(count);

      const rows = this.db.prepare(query).all(...params);

      return rows.map(row => ({
        id: row.id,
        question: row.question,
        options: JSON.parse(row.options),
        correctAnswer: row.correct_answer,
        category: row.category,
        difficulty: row.difficulty,
        points: row.points
      }));
    } catch (error) {
      console.error('✗ Failed to get questions:', error.message);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      console.log('✓ Database connection closed');
    }
  }
}

module.exports = GameDatabase;
