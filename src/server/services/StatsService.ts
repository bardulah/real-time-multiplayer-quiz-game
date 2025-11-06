import { getDatabase } from '../database';
import { PlayerStats, GameResult, GameHistory } from '../types';
import logger from '../utils/logger';

export class StatsService {
  private db = getDatabase();

  /**
   * Get or create player stats
   */
  getPlayerStats(playerId: string, playerName: string): PlayerStats {
    try {
      // Ensure player exists
      this.ensurePlayerExists(playerId, playerName);

      // Get stats
      const stats = this.db.prepare(`
        SELECT * FROM player_stats WHERE player_id = ?
      `).get(playerId) as any;

      if (!stats) {
        // Create initial stats
        this.initializeStats(playerId);
        return this.getPlayerStats(playerId, playerName);
      }

      // Get recent game history
      const history = this.db.prepare(`
        SELECT * FROM game_history
        WHERE player_id = ?
        ORDER BY game_date DESC
        LIMIT 10
      `).all(playerId) as any[];

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
        difficultiesPlayed: JSON.parse(stats.difficulties_played),
        gamesHistory: history.map(h => ({
          date: h.game_date,
          score: h.score,
          rank: h.rank,
          correctAnswers: h.correct_answers,
          totalQuestions: h.total_questions,
          category: h.category,
          difficulty: h.difficulty
        })),
        lastPlayed: this.getPlayerLastPlayed(playerId),
        createdAt: this.getPlayerCreatedAt(playerId)
      };
    } catch (error) {
      logger.error('Failed to get player stats', { error, playerId });
      throw error;
    }
  }

  /**
   * Update stats after a game
   */
  updateGameStats(playerId: string, playerName: string, gameResult: GameResult): PlayerStats {
    try {
      this.ensurePlayerExists(playerId, playerName);

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

      // Update category and difficulty counts
      const categoriesPlayed = { ...stats.categoriesPlayed };
      categoriesPlayed[gameResult.category] = (categoriesPlayed[gameResult.category] || 0) + 1;

      const difficultiesPlayed = { ...stats.difficultiesPlayed };
      difficultiesPlayed[gameResult.difficulty] = (difficultiesPlayed[gameResult.difficulty] || 0) + 1;

      // Update stats in database
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
        newTotalGames,
        newWins,
        newTotalScore,
        newTotalCorrect,
        newTotalQuestions,
        newBestScore,
        newAverageScore,
        newWinRate,
        newAccuracy,
        newFastestAnswer,
        JSON.stringify(categoriesPlayed),
        JSON.stringify(difficultiesPlayed),
        playerId
      );

      // Add to game history
      this.db.prepare(`
        INSERT INTO game_history
        (player_id, score, rank, correct_answers, total_questions, category, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        playerId,
        gameResult.score,
        gameResult.rank,
        gameResult.correctAnswers,
        gameResult.totalQuestions,
        gameResult.category,
        gameResult.difficulty
      );

      // Update last played
      this.db.prepare(`
        UPDATE players SET last_played = datetime('now') WHERE id = ?
      `).run(playerId);

      logger.info('Stats updated', { playerId, gameResult });

      return this.getPlayerStats(playerId, playerName);
    } catch (error) {
      logger.error('Failed to update game stats', { error, playerId, gameResult });
      throw error;
    }
  }

  /**
   * Get top players by various metrics
   */
  getTopPlayers(metric: string = 'totalScore', limit: number = 10): PlayerStats[] {
    try {
      const validMetrics: Record<string, string> = {
        totalScore: 'total_score',
        wins: 'wins',
        winRate: 'win_rate',
        accuracy: 'accuracy',
        bestScore: 'best_score',
        totalGames: 'total_games'
      };

      const column = validMetrics[metric] || 'total_score';

      const rows = this.db.prepare(`
        SELECT ps.*, p.name as player_name
        FROM player_stats ps
        JOIN players p ON p.id = ps.player_id
        WHERE ps.total_games > 0
        ORDER BY ps.${column} DESC
        LIMIT ?
      `).all(limit) as any[];

      return rows.map(row => ({
        playerId: row.player_id,
        playerName: row.player_name,
        totalGames: row.total_games,
        wins: row.wins,
        totalScore: row.total_score,
        totalCorrectAnswers: row.total_correct_answers,
        totalQuestions: row.total_questions,
        bestScore: row.best_score,
        averageScore: row.average_score,
        winRate: row.win_rate,
        accuracy: row.accuracy,
        fastestAnswer: row.fastest_answer,
        categoriesPlayed: JSON.parse(row.categories_played),
        difficultiesPlayed: JSON.parse(row.difficulties_played),
        gamesHistory: [],
        lastPlayed: row.updated_at,
        createdAt: row.updated_at
      }));
    } catch (error) {
      logger.error('Failed to get top players', { error, metric, limit });
      return [];
    }
  }

  private ensurePlayerExists(playerId: string, playerName: string): void {
    const exists = this.db.prepare('SELECT 1 FROM players WHERE id = ?').get(playerId);

    if (!exists) {
      this.db.prepare(`
        INSERT INTO players (id, name) VALUES (?, ?)
      `).run(playerId, playerName);
    }
  }

  private initializeStats(playerId: string): void {
    this.db.prepare(`
      INSERT INTO player_stats (player_id)
      VALUES (?)
    `).run(playerId);
  }

  private getPlayerLastPlayed(playerId: string): string {
    const result = this.db.prepare('SELECT last_played FROM players WHERE id = ?').get(playerId) as any;
    return result?.last_played || new Date().toISOString();
  }

  private getPlayerCreatedAt(playerId: string): string {
    const result = this.db.prepare('SELECT created_at FROM players WHERE id = ?').get(playerId) as any;
    return result?.created_at || new Date().toISOString();
  }
}

export default new StatsService();
