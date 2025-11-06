// Test questionBank integration with database
// Run with: node server/test-questions-integration.js

const QuestionBank = require('./questionBank');

console.log('=== Testing QuestionBank Database Integration ===\n');

const bank = new QuestionBank();

try {
  // Test 1: Get all questions (no filter)
  console.log('Test 1: Get random questions (no filter)');
  const allQuestions = bank.getQuestions(5);
  console.log('✓ Retrieved', allQuestions.length, 'random questions');

  if (allQuestions.length > 0) {
    console.log('  Sample question:', allQuestions[0].question);
    console.log('  Category:', allQuestions[0].category);
    console.log('  Difficulty:', allQuestions[0].difficulty);
    console.log('  Points:', allQuestions[0].points);
  }
  console.log('');

  // Test 2: Get questions by difficulty
  console.log('Test 2: Get questions filtered by difficulty (easy)');
  const easyQuestions = bank.getQuestions(5, 'easy');
  console.log('✓ Retrieved', easyQuestions.length, 'easy questions');

  const allEasy = easyQuestions.every(q => q.difficulty === 'easy');
  if (!allEasy) {
    throw new Error('Not all questions are easy!');
  }
  console.log('  All questions are easy ✓');
  console.log('');

  // Test 3: Get questions by category
  console.log('Test 3: Get questions filtered by category (Science)');
  const scienceQuestions = bank.getQuestions(5, null, 'Science');
  console.log('✓ Retrieved', scienceQuestions.length, 'Science questions');

  const allScience = scienceQuestions.every(q => q.category === 'Science');
  if (!allScience) {
    throw new Error('Not all questions are Science!');
  }
  console.log('  All questions are Science ✓');
  console.log('');

  // Test 4: Get questions by both difficulty and category
  console.log('Test 4: Get questions filtered by difficulty AND category (medium History)');
  const mediumHistory = bank.getQuestions(5, 'medium', 'History');
  console.log('✓ Retrieved', mediumHistory.length, 'medium History questions');

  if (mediumHistory.length > 0) {
    const allMatch = mediumHistory.every(
      q => q.difficulty === 'medium' && q.category === 'History'
    );
    if (!allMatch) {
      throw new Error('Not all questions match both filters!');
    }
    console.log('  All questions match both filters ✓');
  }
  console.log('');

  // Test 5: Get question by ID
  console.log('Test 5: Get specific question by ID');
  const questionById = bank.getQuestionById(1);

  if (!questionById) {
    throw new Error('Question with ID 1 not found!');
  }

  console.log('✓ Retrieved question by ID');
  console.log('  Question:', questionById.question);
  console.log('  Options:', questionById.options);
  console.log('  Correct answer:', questionById.correctAnswer);
  console.log('');

  // Test 6: Get all categories
  console.log('Test 6: Get all unique categories');
  const categories = bank.getCategories();
  console.log('✓ Retrieved categories:', categories);

  if (categories.length === 0) {
    throw new Error('No categories found!');
  }

  const expectedCategories = ['Geography', 'History', 'Science', 'Sports', 'Technology'];
  const allCategoriesPresent = expectedCategories.every(cat => categories.includes(cat));
  if (!allCategoriesPresent) {
    throw new Error('Not all expected categories found!');
  }
  console.log('  All expected categories present ✓');
  console.log('');

  // Test 7: Get all difficulties
  console.log('Test 7: Get all difficulty levels');
  const difficulties = bank.getDifficulties();
  console.log('✓ Retrieved difficulties:', difficulties);

  if (difficulties.length === 0) {
    throw new Error('No difficulties found!');
  }

  const expectedDifficulties = ['easy', 'medium', 'hard'];
  const allDifficultiesPresent = expectedDifficulties.every(diff => difficulties.includes(diff));
  if (!allDifficultiesPresent) {
    throw new Error('Not all expected difficulties found!');
  }
  console.log('  All expected difficulties present ✓');
  console.log('');

  // Test 8: Test calculatePoints method
  console.log('Test 8: Test points calculation (speed bonus)');
  const basePoints = 100;
  const questionDuration = 15000; // 15 seconds

  // Fast answer (2 seconds) - should get bonus
  const fastPoints = bank.calculatePoints(basePoints, 2000, questionDuration);
  console.log('  Fast answer (2s):', fastPoints, 'points');

  // Medium answer (7.5 seconds) - should get some bonus
  const mediumPoints = bank.calculatePoints(basePoints, 7500, questionDuration);
  console.log('  Medium answer (7.5s):', mediumPoints, 'points');

  // Slow answer (14 seconds) - should get minimal/no bonus
  const slowPoints = bank.calculatePoints(basePoints, 14000, questionDuration);
  console.log('  Slow answer (14s):', slowPoints, 'points');

  if (fastPoints <= basePoints || slowPoints > mediumPoints || mediumPoints > fastPoints) {
    throw new Error('Points calculation is incorrect!');
  }
  console.log('  Points calculation working correctly ✓');
  console.log('');

  // Test 9: Test persistence - create new instance
  console.log('Test 9: Create new QuestionBank instance (test persistence)');
  const bank2 = new QuestionBank();
  const persistedQuestions = bank2.getQuestions(3);

  console.log('✓ New instance created and questions retrieved');
  console.log('  Retrieved', persistedQuestions.length, 'questions');

  if (persistedQuestions.length === 0) {
    throw new Error('Questions should be persisted in database!');
  }
  console.log('  Questions persisted correctly ✓');
  console.log('');

  // Test 10: Test randomization
  console.log('Test 10: Test that questions are randomized');
  const set1 = bank.getQuestions(10);
  const set2 = bank.getQuestions(10);

  // Check if at least some questions are different (order or selection)
  const firstQuestionsDifferent = set1[0].id !== set2[0].id;
  console.log('  First question in set 1:', set1[0].question.substring(0, 40) + '...');
  console.log('  First question in set 2:', set2[0].question.substring(0, 40) + '...');

  if (firstQuestionsDifferent) {
    console.log('  Questions are being randomized ✓');
  } else {
    console.log('  Warning: Questions might not be randomized (could be chance)');
  }
  console.log('');

  console.log('=== All Tests Passed ✓ ===');
  console.log('\nQuestionBank database integration is working correctly!');
  console.log('Questions are being loaded from:', bank.db.dbPath);

} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
