// Statistics tracker for player performance
// Now with database persistence!
const GameDatabase = require('./database');

class StatsTracker {
  constructor() {
    // Initialize database connection
    this.db = new GameDatabase();
    this.db.init();
    console.log('✓ StatsTracker initialized with database persistence');
  }

  // Get or create player stats
  getPlayerStats(playerId, playerName) {
    try {
      return this.db.getPlayerStats(playerId, playerName);
    } catch (error) {
      console.error('Error getting player stats:', error);
      // Return default stats if database fails (graceful degradation)
      return {
        playerId: playerId,
        playerName: playerName,
        totalGames: 0,
        wins: 0,
        totalScore: 0,
        totalCorrectAnswers: 0,
        totalQuestions: 0,
        bestScore: 0,
        averageScore: 0,
        winRate: 0,
        accuracy: 0,
        fastestAnswer: null,
        categoriesPlayed: {},
        difficultiesPlayed: {},
        gamesHistory: []
      };
    }
  }

  // Update stats after a game
  updateGameStats(playerId, playerName, gameResult) {
    try {
      // Database now handles all the logic!
      return this.db.updatePlayerStats(playerId, playerName, gameResult);
    } catch (error) {
      console.error('Error updating player stats:', error);
      // Return current stats if update fails
      return this.getPlayerStats(playerId, playerName);
    }
  }

  // Get all player stats (for leaderboards)
  getAllStats() {
    // This could be slow for many players, but works for now
    // In future, could add a database method for this
    return this.getTopPlayers('totalScore', 1000);
  }

  // Get top players by various metrics
  getTopPlayers(metric = 'totalScore', limit = 10) {
    try {
      // Get top players from database directly
      const query = this.getTopPlayersQuery(metric, limit);
      const rows = this.db.db.prepare(query).all(limit);

      return rows.map(row => ({
        playerId: row.player_id,
        playerName: row.name,
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
        difficultiesPlayed: JSON.parse(row.difficulties_played)
      }));
    } catch (error) {
      console.error('Error getting top players:', error);
      return [];
    }
  }

  // Helper to get the right SQL query for different metrics
  getTopPlayersQuery(metric, limit) {
    const metricColumn = {
      'wins': 'wins',
      'winRate': 'win_rate',
      'bestScore': 'best_score',
      'accuracy': 'accuracy',
      'totalGames': 'total_games',
      'totalScore': 'total_score'
    }[metric] || 'total_score';

    return `
      SELECT ps.*, p.name
      FROM player_stats ps
      JOIN players p ON p.id = ps.player_id
      WHERE ps.total_games > 0
      ORDER BY ps.${metricColumn} DESC
      LIMIT ?
    `;
  }

  // Calculate game result from game data
  calculateGameResult(game, playerId) {
    const player = game.getPlayer(playerId);
    if (!player) return null;

    const leaderboard = game.getLeaderboard();
    const playerRank = leaderboard.findIndex(p => p.id === playerId) + 1;
    const isWinner = playerRank === 1;

    // Find fastest answer time
    let fastestAnswer = null;
    player.answers.forEach(answer => {
      if (answer.isCorrect && answer.answerTime) {
        if (!fastestAnswer || answer.answerTime < fastestAnswer) {
          fastestAnswer = answer.answerTime;
        }
      }
    });

    return {
      score: player.score,
      correctAnswers: player.answers.filter(a => a.isCorrect).length,
      totalQuestions: player.answers.length,
      rank: playerRank,
      isWinner: isWinner,
      fastestAnswer: fastestAnswer,
      category: game.category || 'Mixed',
      difficulty: game.difficulty || 'Mixed'
    };
  }
}

module.exports = StatsTracker;
