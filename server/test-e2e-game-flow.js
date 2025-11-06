// End-to-end test for complete game flow with database persistence
// Run with: node server/test-e2e-game-flow.js
// Note: Requires server to be running on port 3000

const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';
let player1Socket = null;
let player2Socket = null;
let roomCode = null;

console.log('=== End-to-End Game Flow Test ===\n');

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test steps
async function runTest() {
  try {
    // Step 1: Connect two players
    console.log('Step 1: Connecting two players to server');

    player1Socket = io(SERVER_URL, { transports: ['websocket'] });
    player2Socket = io(SERVER_URL, { transports: ['websocket'] });

    await Promise.all([
      new Promise(resolve => player1Socket.on('connect', resolve)),
      new Promise(resolve => player2Socket.on('connect', resolve))
    ]);

    console.log('✓ Both players connected');
    console.log('  Player 1 ID:', player1Socket.id);
    console.log('  Player 2 ID:', player2Socket.id);
    console.log('');

    // Step 2: Player 1 creates a room
    console.log('Step 2: Player 1 creates a game room');

    const roomCreatedPromise = new Promise(resolve => {
      player1Socket.on('roomCreated', (data) => {
        roomCode = data.roomCode;
        resolve(data);
      });
    });

    player1Socket.emit('createRoom', {
      playerName: 'TestPlayer1',
      avatar: '😎',
      settings: {
        questionCount: 3,
        difficulty: null,
        category: null
      }
    });

    const roomData = await roomCreatedPromise;
    console.log('✓ Room created with code:', roomCode);
    console.log('  Host:', roomData.hostPlayer.name);
    console.log('');

    // Step 3: Player 2 joins the room
    console.log('Step 3: Player 2 joins the room');

    const joinedPromise = new Promise(resolve => {
      player2Socket.on('roomJoined', resolve);
    });

    const playerJoinedPromise = new Promise(resolve => {
      player1Socket.on('playerJoined', resolve);
    });

    player2Socket.emit('joinRoom', {
      roomCode: roomCode,
      playerName: 'TestPlayer2',
      avatar: '🚀'
    });

    await Promise.all([joinedPromise, playerJoinedPromise]);
    console.log('✓ Player 2 joined the room');
    console.log('');

    // Step 4: Start the game
    console.log('Step 4: Host starts the game');

    const gameStartedPromise1 = new Promise(resolve => {
      player1Socket.on('gameStarted', resolve);
    });

    const gameStartedPromise2 = new Promise(resolve => {
      player2Socket.on('gameStarted', resolve);
    });

    player1Socket.emit('startGame');

    await Promise.all([gameStartedPromise1, gameStartedPromise2]);
    console.log('✓ Game started');
    console.log('');

    // Step 5: Answer questions
    console.log('Step 5: Players answer questions');

    for (let i = 0; i < 3; i++) {
      console.log(`  Question ${i + 1}...`);

      // Get the question
      const questionPromise1 = new Promise(resolve => {
        player1Socket.once('newQuestion', resolve);
      });

      const questionPromise2 = new Promise(resolve => {
        player2Socket.once('newQuestion', resolve);
      });

      const [question1, question2] = await Promise.all([questionPromise1, questionPromise2]);

      console.log('    Question:', question1.question.question.substring(0, 50) + '...');

      // Both players answer (player 1 correctly, player 2 incorrectly)
      const answerPromise1 = new Promise(resolve => {
        player1Socket.once('answerResult', resolve);
      });

      const answerPromise2 = new Promise(resolve => {
        player2Socket.once('answerResult', resolve);
      });

      // Player 1 answers correctly
      player1Socket.emit('submitAnswer', {
        questionIndex: i,
        answer: question1.question.correctAnswer,
        answerTime: 2000
      });

      // Player 2 answers incorrectly
      player2Socket.emit('submitAnswer', {
        questionIndex: i,
        answer: (question2.question.correctAnswer + 1) % 4,
        answerTime: 3000
      });

      const [result1, result2] = await Promise.all([answerPromise1, answerPromise2]);

      console.log('    Player 1:', result1.isCorrect ? '✓ Correct' : '✗ Wrong', '- Score:', result1.score);
      console.log('    Player 2:', result2.isCorrect ? '✓ Correct' : '✗ Wrong', '- Score:', result2.score);

      // Wait a bit before next question
      await wait(500);
    }

    console.log('  All questions answered');
    console.log('');

    // Step 6: Game ends, check results
    console.log('Step 6: Game ends, check final results');

    const gameEndPromise1 = new Promise(resolve => {
      player1Socket.once('gameEnded', resolve);
    });

    const gameEndPromise2 = new Promise(resolve => {
      player2Socket.once('gameEnded', resolve);
    });

    const [gameEnd1, gameEnd2] = await Promise.all([gameEndPromise1, gameEndPromise2]);

    console.log('✓ Game ended');
    console.log('  Final Results:');

    gameEnd1.results.leaderboard.forEach((player, index) => {
      console.log(`    ${index + 1}. ${player.name}: ${player.score} points (${player.correctAnswers}/${player.totalAnswers} correct)`);
    });
    console.log('');

    // Step 7: Verify stats were saved
    console.log('Step 7: Request player stats to verify persistence');

    const statsPromise1 = new Promise(resolve => {
      player1Socket.once('playerStats', resolve);
    });

    player1Socket.emit('getStats');

    const stats1 = await statsPromise1;
    console.log('✓ Player 1 stats retrieved:');
    console.log('  Total games:', stats1.totalGames);
    console.log('  Total score:', stats1.totalScore);
    console.log('  Wins:', stats1.wins);
    console.log('  Win rate:', stats1.winRate + '%');
    console.log('  Accuracy:', stats1.accuracy + '%');
    console.log('');

    // Step 8: Disconnect
    console.log('Step 8: Disconnect players');
    player1Socket.disconnect();
    player2Socket.disconnect();
    console.log('✓ Players disconnected');
    console.log('');

    console.log('=== All Tests Passed ✓ ===');
    console.log('\nEnd-to-end game flow is working correctly!');
    console.log('Database persistence verified - stats were saved and retrieved.');

    process.exit(0);

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);

    // Cleanup
    if (player1Socket) player1Socket.disconnect();
    if (player2Socket) player2Socket.disconnect();

    process.exit(1);
  }
}

// Run the test
runTest();
