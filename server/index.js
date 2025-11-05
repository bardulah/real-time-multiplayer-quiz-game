const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const gameManager = new GameManager();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Create a new game room
  socket.on('createGame', ({ playerName, settings }) => {
    const gameId = generateGameId();
    const game = gameManager.createGame(gameId, socket.id, settings);
    game.addPlayer(socket.id, playerName);

    socket.join(gameId);
    socket.emit('gameCreated', {
      gameId,
      playerId: socket.id,
      gameInfo: game.getGameInfo()
    });

    console.log(`Game created: ${gameId} by ${playerName}`);
  });

  // Join an existing game
  socket.on('joinGame', ({ gameId, playerName }) => {
    const result = gameManager.joinGame(gameId, socket.id, playerName);

    if (result.success) {
      socket.join(gameId);
      socket.emit('gameJoined', {
        gameId,
        playerId: socket.id,
        gameInfo: result.game.getGameInfo()
      });

      // Notify all players in the room
      io.to(gameId).emit('playerJoined', {
        player: { id: socket.id, name: playerName },
        players: result.game.getPlayers()
      });

      console.log(`${playerName} joined game: ${gameId}`);
    } else {
      socket.emit('joinError', { error: result.error });
    }
  });

  // Start the game
  socket.on('startGame', ({ gameId }) => {
    const game = gameManager.getGame(gameId);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (socket.id !== game.hostId) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }

    const result = game.startGame();

    if (result.success) {
      io.to(gameId).emit('gameStarted', {
        totalQuestions: game.questions.length
      });

      // Start the first question after a short delay
      setTimeout(() => {
        sendNextQuestion(gameId);
      }, 2000);

      console.log(`Game started: ${gameId}`);
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // Submit an answer
  socket.on('submitAnswer', ({ gameId, answerIndex, answerTime }) => {
    const game = gameManager.getGame(gameId);

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const result = game.submitAnswer(socket.id, answerIndex, answerTime);

    if (result.success) {
      socket.emit('answerResult', {
        isCorrect: result.isCorrect,
        pointsEarned: result.pointsEarned,
        correctAnswer: result.correctAnswer
      });

      // Update leaderboard for all players
      io.to(gameId).emit('leaderboardUpdate', {
        leaderboard: game.getLeaderboard()
      });

      // Check if all players have answered
      if (game.allPlayersAnswered()) {
        // Move to next question after a short delay
        setTimeout(() => {
          const nextResult = game.nextQuestion();

          if (nextResult.hasMoreQuestions) {
            sendNextQuestion(gameId);
          } else {
            endGame(gameId);
          }
        }, 3000);
      }
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // Request current leaderboard
  socket.on('getLeaderboard', ({ gameId }) => {
    const game = gameManager.getGame(gameId);

    if (game) {
      socket.emit('leaderboardUpdate', {
        leaderboard: game.getLeaderboard()
      });
    }
  });

  // Player disconnection
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    const gameId = gameManager.playerToGame.get(socket.id);
    if (gameId) {
      const game = gameManager.getGame(gameId);
      if (game) {
        const player = game.getPlayer(socket.id);
        const playerName = player ? player.name : 'Unknown';

        gameManager.removePlayer(socket.id);

        // Notify remaining players
        io.to(gameId).emit('playerLeft', {
          playerId: socket.id,
          playerName,
          players: game.players.size > 0 ? game.getPlayers() : []
        });

        console.log(`${playerName} left game: ${gameId}`);
      }
    }
  });

  // Get list of available games
  socket.on('getGames', () => {
    socket.emit('gamesList', {
      games: gameManager.getActiveGames()
    });
  });
});

// Helper function to send the next question to all players
function sendNextQuestion(gameId) {
  const game = gameManager.getGame(gameId);

  if (!game) return;

  const question = game.getCurrentQuestion();

  if (question) {
    game.questionStartTime = Date.now();

    io.to(gameId).emit('newQuestion', {
      ...question,
      startTime: game.questionStartTime
    });

    // Auto-advance to next question when time runs out
    setTimeout(() => {
      // Only advance if not all players have answered yet
      if (!game.allPlayersAnswered()) {
        const nextResult = game.nextQuestion();

        if (nextResult.hasMoreQuestions) {
          sendNextQuestion(gameId);
        } else {
          endGame(gameId);
        }
      }
    }, game.questionDuration + 1000);
  }
}

// Helper function to end the game and show results
function endGame(gameId) {
  const game = gameManager.getGame(gameId);

  if (!game) return;

  const results = game.getFinalResults();

  io.to(gameId).emit('gameEnded', results);

  console.log(`Game ended: ${gameId}`);
}

// Helper function to generate a random game ID
function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Start the server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎮  Real-Time Multiplayer Quiz Game Server  🎮          ║
║                                                            ║
║   Server running on http://localhost:${PORT}                ║
║                                                            ║
║   Features:                                                ║
║   ✓ Real-time multiplayer gameplay                        ║
║   ✓ Live scoring and leaderboards                         ║
║   ✓ Multiple question categories                          ║
║   ✓ Speed-based bonus points                              ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server };
