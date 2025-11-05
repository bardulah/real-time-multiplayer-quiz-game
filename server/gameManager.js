const QuestionBank = require('./questionBank');

class GameManager {
  constructor() {
    this.games = new Map(); // gameId -> Game instance
    this.playerToGame = new Map(); // playerId -> gameId
    this.questionBank = new QuestionBank();
  }

  // Create a new game room
  createGame(gameId, hostId, settings = {}) {
    const game = new Game(gameId, hostId, this.questionBank, settings);
    this.games.set(gameId, game);
    this.playerToGame.set(hostId, gameId);
    return game;
  }

  // Get a game by ID
  getGame(gameId) {
    return this.games.get(gameId);
  }

  // Join an existing game
  joinGame(gameId, playerId, playerName) {
    const game = this.games.get(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    if (game.state !== 'waiting') {
      return { success: false, error: 'Game already in progress' };
    }

    if (game.players.size >= game.maxPlayers) {
      return { success: false, error: 'Game is full' };
    }

    game.addPlayer(playerId, playerName);
    this.playerToGame.set(playerId, gameId);
    return { success: true, game };
  }

  // Remove a player from their current game
  removePlayer(playerId) {
    const gameId = this.playerToGame.get(playerId);
    if (!gameId) return;

    const game = this.games.get(gameId);
    if (game) {
      game.removePlayer(playerId);

      // Delete game if empty or host left
      if (game.players.size === 0 || playerId === game.hostId) {
        this.games.delete(gameId);
        // Remove all players from this game
        game.players.forEach((player, pid) => {
          this.playerToGame.delete(pid);
        });
      }
    }

    this.playerToGame.delete(playerId);
  }

  // Get all active games
  getActiveGames() {
    return Array.from(this.games.values())
      .filter(game => game.state === 'waiting')
      .map(game => game.getGameInfo());
  }
}

class Game {
  constructor(gameId, hostId, questionBank, settings = {}) {
    this.gameId = gameId;
    this.hostId = hostId;
    this.questionBank = questionBank;
    this.state = 'waiting'; // waiting, playing, finished
    this.players = new Map(); // playerId -> Player object
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.questionStartTime = null;
    this.questionTimer = null;

    // Game settings
    this.maxPlayers = settings.maxPlayers || 10;
    this.questionCount = settings.questionCount || 10;
    this.questionDuration = settings.questionDuration || 15000; // 15 seconds
    this.category = settings.category || null;
    this.difficulty = settings.difficulty || null;
  }

  // Add a player to the game
  addPlayer(playerId, playerName) {
    const player = {
      id: playerId,
      name: playerName,
      score: 0,
      answers: [],
      isReady: false,
      isConnected: true
    };
    this.players.set(playerId, player);
    return player;
  }

  // Remove a player from the game
  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  // Get player by ID
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  // Start the game
  startGame() {
    if (this.state !== 'waiting') {
      return { success: false, error: 'Game already started' };
    }

    if (this.players.size < 1) {
      return { success: false, error: 'Not enough players' };
    }

    this.state = 'playing';
    this.questions = this.questionBank.getQuestions(
      this.questionCount,
      this.difficulty,
      this.category
    );
    this.currentQuestionIndex = 0;

    return { success: true };
  }

  // Get the current question (without correct answer)
  getCurrentQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      return null;
    }

    const question = this.questions[this.currentQuestionIndex];
    return {
      questionNumber: this.currentQuestionIndex + 1,
      totalQuestions: this.questions.length,
      question: question.question,
      options: question.options,
      category: question.category,
      difficulty: question.difficulty,
      points: question.points,
      duration: this.questionDuration
    };
  }

  // Submit an answer for a player
  submitAnswer(playerId, answerIndex, answerTime) {
    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    // Check if player already answered this question
    if (player.answers.length > this.currentQuestionIndex) {
      return { success: false, error: 'Already answered' };
    }

    const question = this.questions[this.currentQuestionIndex];
    const isCorrect = answerIndex === question.correctAnswer;

    // Calculate points based on speed (faster = more points)
    let pointsEarned = 0;
    if (isCorrect) {
      pointsEarned = this.questionBank.calculatePoints(
        question.points,
        answerTime,
        this.questionDuration
      );
      player.score += pointsEarned;
    }

    // Record the answer
    player.answers.push({
      questionId: question.id,
      answerIndex,
      isCorrect,
      answerTime,
      pointsEarned
    });

    return {
      success: true,
      isCorrect,
      pointsEarned,
      correctAnswer: question.correctAnswer
    };
  }

  // Move to the next question
  nextQuestion() {
    this.currentQuestionIndex++;

    if (this.currentQuestionIndex >= this.questions.length) {
      this.state = 'finished';
      return { hasMoreQuestions: false };
    }

    return { hasMoreQuestions: true };
  }

  // Get the leaderboard
  getLeaderboard() {
    return Array.from(this.players.values())
      .map(player => ({
        id: player.id,
        name: player.name,
        score: player.score,
        correctAnswers: player.answers.filter(a => a.isCorrect).length,
        totalAnswers: player.answers.length
      }))
      .sort((a, b) => b.score - a.score);
  }

  // Get final results
  getFinalResults() {
    const leaderboard = this.getLeaderboard();
    return {
      leaderboard,
      totalQuestions: this.questions.length,
      winner: leaderboard[0] || null
    };
  }

  // Get game info for lobby display
  getGameInfo() {
    return {
      gameId: this.gameId,
      hostId: this.hostId,
      state: this.state,
      playerCount: this.players.size,
      maxPlayers: this.maxPlayers,
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        isReady: p.isReady
      }))
    };
  }

  // Get players for display
  getPlayers() {
    return Array.from(this.players.values()).map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      isConnected: p.isConnected
    }));
  }

  // Check if all players have answered
  allPlayersAnswered() {
    return Array.from(this.players.values()).every(
      player => player.answers.length > this.currentQuestionIndex
    );
  }

  // Reset the game
  reset() {
    this.state = 'waiting';
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.players.forEach(player => {
      player.score = 0;
      player.answers = [];
      player.isReady = false;
    });
  }
}

module.exports = GameManager;
