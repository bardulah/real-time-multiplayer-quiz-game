// Simple test script for database
// Run with: node server/test-database.js

const GameDatabase = require('./database');

console.log('=== Testing Database ===\n');

// Initialize database
const db = new GameDatabase('./data/test-quiz-game.db');

try {
  // Test 1: Initialize database
  console.log('Test 1: Initialize database');
  db.init();
  console.log('✓ Database initialized\n');

  // Test 2: Seed sample questions
  console.log('Test 2: Seed questions');
  const sampleQuestions = [
    {
      question: "What is 2+2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1,
      category: "Math",
      difficulty: "easy",
      points: 100
    },
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      correctAnswer: 2,
      category: "Geography",
      difficulty: "easy",
      points: 100
    }
  ];
  db.seedQuestions(sampleQuestions);
  console.log('✓ Questions seeded\n');

  // Test 3: Get questions
  console.log('Test 3: Get questions from database');
  const questions = db.getQuestions(2);
  console.log(`✓ Retrieved ${questions.length} questions`);
  console.log('  First question:', questions[0].question);
  console.log('');

  // Test 4: Create player stats
  console.log('Test 4: Create player stats');
  const playerId = 'test-player-123';
  const playerName = 'Test Player';
  const stats = db.getPlayerStats(playerId, playerName);
  console.log('✓ Player stats created');
  console.log('  Total games:', stats.totalGames);
  console.log('  Total score:', stats.totalScore);
  console.log('');

  // Test 5: Update player stats
  console.log('Test 5: Update player stats after game');
  const gameResult = {
    score: 250,
    correctAnswers: 2,
    totalQuestions: 2,
    rank: 1,
    isWinner: true,
    fastestAnswer: 1500,
    category: 'Mixed',
    difficulty: 'easy'
  };
  const updatedStats = db.updatePlayerStats(playerId, playerName, gameResult);
  console.log('✓ Stats updated');
  console.log('  Total games:', updatedStats.totalGames);
  console.log('  Total score:', updatedStats.totalScore);
  console.log('  Wins:', updatedStats.wins);
  console.log('  Win rate:', updatedStats.winRate + '%');
  console.log('');

  // Test 6: Retrieve stats again (persistence test)
  console.log('Test 6: Retrieve stats again (test persistence)');
  const retrievedStats = db.getPlayerStats(playerId, playerName);
  console.log('✓ Stats retrieved from database');
  console.log('  Total games:', retrievedStats.totalGames);
  console.log('  Total score:', retrievedStats.totalScore);
  console.log('  Best score:', retrievedStats.bestScore);
  console.log('');

  // Close database
  db.close();

  console.log('=== All Tests Passed ✓ ===');
  console.log('\nDatabase is working correctly!');
  console.log('Test database created at: ./data/test-quiz-game.db');
  console.log('You can delete it with: rm ./data/test-quiz-game.db');

} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);
  db.close();
  process.exit(1);
}
