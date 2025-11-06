// Test statsTracker integration with database
// Run with: node server/test-stats-integration.js

const StatsTracker = require('./statsTracker');

console.log('=== Testing StatsTracker Database Integration ===\n');

const tracker = new StatsTracker();

try {
  // Test 1: Get initial player stats
  console.log('Test 1: Get initial player stats');
  const playerId = 'integration-test-player-' + Date.now();
  const playerName = 'Integration Test Player';

  const initialStats = tracker.getPlayerStats(playerId, playerName);
  console.log('✓ Initial stats retrieved');
  console.log('  Total games:', initialStats.totalGames);
  console.log('  Total score:', initialStats.totalScore);
  console.log('  Win rate:', initialStats.winRate + '%');
  console.log('');

  if (initialStats.totalGames !== 0) {
    throw new Error('Initial stats should have 0 games');
  }

  // Test 2: Update stats with first game result
  console.log('Test 2: Update stats with first game (winner)');
  const gameResult1 = {
    score: 350,
    correctAnswers: 3,
    totalQuestions: 5,
    rank: 1,
    isWinner: true,
    fastestAnswer: 1200,
    category: 'Science',
    difficulty: 'medium'
  };

  const updatedStats1 = tracker.updateGameStats(playerId, playerName, gameResult1);
  console.log('✓ Stats updated after first game');
  console.log('  Total games:', updatedStats1.totalGames);
  console.log('  Wins:', updatedStats1.wins);
  console.log('  Total score:', updatedStats1.totalScore);
  console.log('  Best score:', updatedStats1.bestScore);
  console.log('  Win rate:', updatedStats1.winRate + '%');
  console.log('  Accuracy:', updatedStats1.accuracy + '%');
  console.log('  Fastest answer:', updatedStats1.fastestAnswer + 'ms');
  console.log('');

  if (updatedStats1.totalGames !== 1) {
    throw new Error('Should have 1 game after first update');
  }
  if (updatedStats1.wins !== 1) {
    throw new Error('Should have 1 win');
  }
  if (updatedStats1.totalScore !== 350) {
    throw new Error('Total score should be 350');
  }

  // Test 3: Update stats with second game result (loss)
  console.log('Test 3: Update stats with second game (loss)');
  const gameResult2 = {
    score: 200,
    correctAnswers: 2,
    totalQuestions: 5,
    rank: 3,
    isWinner: false,
    fastestAnswer: 800,
    category: 'History',
    difficulty: 'easy'
  };

  const updatedStats2 = tracker.updateGameStats(playerId, playerName, gameResult2);
  console.log('✓ Stats updated after second game');
  console.log('  Total games:', updatedStats2.totalGames);
  console.log('  Wins:', updatedStats2.wins);
  console.log('  Total score:', updatedStats2.totalScore);
  console.log('  Best score:', updatedStats2.bestScore);
  console.log('  Win rate:', updatedStats2.winRate + '%');
  console.log('  Accuracy:', updatedStats2.accuracy + '%');
  console.log('  Fastest answer:', updatedStats2.fastestAnswer + 'ms');
  console.log('');

  if (updatedStats2.totalGames !== 2) {
    throw new Error('Should have 2 games');
  }
  if (updatedStats2.wins !== 1) {
    throw new Error('Should still have 1 win');
  }
  if (updatedStats2.winRate !== 50) {
    throw new Error('Win rate should be 50%');
  }
  if (updatedStats2.fastestAnswer !== 800) {
    throw new Error('Fastest answer should be 800ms (from second game)');
  }

  // Test 4: Create new tracker instance and retrieve stats (persistence test)
  console.log('Test 4: Create new tracker instance (test persistence)');
  const tracker2 = new StatsTracker();
  const persistedStats = tracker2.getPlayerStats(playerId, playerName);

  console.log('✓ Stats retrieved from new tracker instance');
  console.log('  Total games:', persistedStats.totalGames);
  console.log('  Wins:', persistedStats.wins);
  console.log('  Total score:', persistedStats.totalScore);
  console.log('  Best score:', persistedStats.bestScore);
  console.log('  Win rate:', persistedStats.winRate + '%');
  console.log('');

  if (persistedStats.totalGames !== 2) {
    throw new Error('Persisted stats should have 2 games');
  }
  if (persistedStats.totalScore !== 550) {
    throw new Error('Persisted total score should be 550');
  }

  // Test 5: Test category tracking
  console.log('Test 5: Test category and difficulty tracking');
  console.log('  Categories played:', JSON.stringify(persistedStats.categoriesPlayed));
  console.log('  Difficulties played:', JSON.stringify(persistedStats.difficultiesPlayed));
  console.log('');

  if (!persistedStats.categoriesPlayed.Science || persistedStats.categoriesPlayed.Science !== 1) {
    throw new Error('Science category should have 1 game');
  }
  if (!persistedStats.categoriesPlayed.History || persistedStats.categoriesPlayed.History !== 1) {
    throw new Error('History category should have 1 game');
  }

  // Test 6: Test top players query
  console.log('Test 6: Test top players query');
  const topPlayers = tracker.getTopPlayers('totalScore', 10);
  console.log('✓ Top players retrieved');
  console.log('  Number of players:', topPlayers.length);

  const ourPlayer = topPlayers.find(p => p.playerId === playerId);
  if (ourPlayer) {
    console.log('  Our test player found in leaderboard');
    console.log('    Name:', ourPlayer.playerName);
    console.log('    Score:', ourPlayer.totalScore);
  }
  console.log('');

  // Test 7: Test calculateGameResult helper
  console.log('Test 7: Test calculateGameResult helper');
  const mockGame = {
    category: 'Geography',
    difficulty: 'hard',
    getPlayer: (id) => ({
      score: 500,
      answers: [
        { isCorrect: true, answerTime: 1500 },
        { isCorrect: true, answerTime: 2000 },
        { isCorrect: false, answerTime: 3000 },
        { isCorrect: true, answerTime: 1000 }
      ]
    }),
    getLeaderboard: () => [
      { id: 'other-player', score: 600 },
      { id: playerId, score: 500 }
    ]
  };

  const gameResult = tracker.calculateGameResult(mockGame, playerId);
  console.log('✓ Game result calculated');
  console.log('  Score:', gameResult.score);
  console.log('  Correct answers:', gameResult.correctAnswers);
  console.log('  Total questions:', gameResult.totalQuestions);
  console.log('  Rank:', gameResult.rank);
  console.log('  Is winner:', gameResult.isWinner);
  console.log('  Fastest answer:', gameResult.fastestAnswer + 'ms');
  console.log('');

  if (gameResult.rank !== 2) {
    throw new Error('Player should be rank 2');
  }
  if (gameResult.fastestAnswer !== 1000) {
    throw new Error('Fastest answer should be 1000ms');
  }

  console.log('=== All Tests Passed ✓ ===');
  console.log('\nStatsTracker database integration is working correctly!');
  console.log('Stats are being persisted to:', tracker.db.dbPath);

} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
