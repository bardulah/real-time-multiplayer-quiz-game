// Statistics tracker for player performance
class StatsTracker {
  constructor() {
    this.playerStats = new Map(); // playerId -> stats object
  }

  // Get or create player stats
  getPlayerStats(playerId, playerName) {
    if (!this.playerStats.has(playerId)) {
      this.playerStats.set(playerId, {
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
      });
    }
    return this.playerStats.get(playerId);
  }

  // Update stats after a game
  updateGameStats(playerId, playerName, gameResult) {
    const stats = this.getPlayerStats(playerId, playerName);

    stats.totalGames++;
    stats.totalScore += gameResult.score;
    stats.totalCorrectAnswers += gameResult.correctAnswers;
    stats.totalQuestions += gameResult.totalQuestions;

    // Update best score
    if (gameResult.score > stats.bestScore) {
      stats.bestScore = gameResult.score;
    }

    // Update win count
    if (gameResult.isWinner) {
      stats.wins++;
    }

    // Calculate averages
    stats.averageScore = Math.round(stats.totalScore / stats.totalGames);
    stats.winRate = Math.round((stats.wins / stats.totalGames) * 100);
    stats.accuracy = Math.round((stats.totalCorrectAnswers / stats.totalQuestions) * 100);

    // Update fastest answer
    if (gameResult.fastestAnswer) {
      if (!stats.fastestAnswer || gameResult.fastestAnswer < stats.fastestAnswer) {
        stats.fastestAnswer = gameResult.fastestAnswer;
      }
    }

    // Track categories played
    if (gameResult.category) {
      stats.categoriesPlayed[gameResult.category] =
        (stats.categoriesPlayed[gameResult.category] || 0) + 1;
    }

    // Track difficulties played
    if (gameResult.difficulty) {
      stats.difficultiesPlayed[gameResult.difficulty] =
        (stats.difficultiesPlayed[gameResult.difficulty] || 0) + 1;
    }

    // Add to games history (keep last 10 games)
    stats.gamesHistory.unshift({
      date: new Date().toISOString(),
      score: gameResult.score,
      rank: gameResult.rank,
      correctAnswers: gameResult.correctAnswers,
      totalQuestions: gameResult.totalQuestions,
      category: gameResult.category,
      difficulty: gameResult.difficulty
    });

    if (stats.gamesHistory.length > 10) {
      stats.gamesHistory = stats.gamesHistory.slice(0, 10);
    }

    return stats;
  }

  // Get all player stats (for leaderboards)
  getAllStats() {
    return Array.from(this.playerStats.values());
  }

  // Get top players by various metrics
  getTopPlayers(metric = 'totalScore', limit = 10) {
    const stats = this.getAllStats();

    stats.sort((a, b) => {
      switch (metric) {
        case 'wins':
          return b.wins - a.wins;
        case 'winRate':
          return b.winRate - a.winRate;
        case 'bestScore':
          return b.bestScore - a.bestScore;
        case 'accuracy':
          return b.accuracy - a.accuracy;
        case 'totalGames':
          return b.totalGames - a.totalGames;
        default:
          return b.totalScore - a.totalScore;
      }
    });

    return stats.slice(0, limit);
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
