// Quick check of database contents
const Database = require('better-sqlite3');
const db = new Database('./data/quiz-game.db');

console.log('=== Database Contents Check ===\n');

try {
  // Check questions
  const questionCount = db.prepare('SELECT COUNT(*) as count FROM questions').get();
  console.log('Questions in database:', questionCount.count);

  // Show sample questions
  const sampleQuestions = db.prepare('SELECT category, difficulty, COUNT(*) as count FROM questions GROUP BY category, difficulty').all();
  console.log('\nQuestions by category and difficulty:');
  sampleQuestions.forEach(row => {
    console.log(`  ${row.category} (${row.difficulty}): ${row.count} questions`);
  });

  // Check players
  const playerCount = db.prepare('SELECT COUNT(*) as count FROM players').get();
  console.log('\nPlayers in database:', playerCount.count);

  // Check player stats
  const statsCount = db.prepare('SELECT COUNT(*) as count FROM player_stats').get();
  console.log('Player stats records:', statsCount.count);

  // Check game history
  const historyCount = db.prepare('SELECT COUNT(*) as count FROM game_history').get();
  console.log('Game history records:', historyCount.count);

  // Show recent players
  if (playerCount.count > 0) {
    const recentPlayers = db.prepare('SELECT name, created_at FROM players ORDER BY created_at DESC LIMIT 5').all();
    console.log('\nRecent players:');
    recentPlayers.forEach(player => {
      console.log(`  - ${player.name} (joined ${player.created_at})`);
    });
  }

  console.log('\n✓ Database is properly initialized and populated');

} catch (error) {
  console.error('Error checking database:', error);
} finally {
  db.close();
}
