// Socket.io connection
const socket = io();

// Game state
let gameState = {
  gameId: null,
  playerId: null,
  playerName: null,
  isHost: false,
  currentQuestion: null,
  questionStartTime: null,
  score: 0,
  hasAnswered: false
};

// DOM Elements
const screens = {
  welcome: document.getElementById('welcomeScreen'),
  lobby: document.getElementById('lobbyScreen'),
  game: document.getElementById('gameScreen'),
  results: document.getElementById('resultsScreen')
};

// Welcome Screen Elements
const playerNameInput = document.getElementById('playerNameInput');
const createGameBtn = document.getElementById('createGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const joinGameForm = document.getElementById('joinGameForm');
const gameIdInput = document.getElementById('gameIdInput');
const joinGameSubmitBtn = document.getElementById('joinGameSubmitBtn');
const cancelJoinBtn = document.getElementById('cancelJoinBtn');

// Lobby Screen Elements
const gameIdDisplay = document.getElementById('gameIdDisplay');
const playerCount = document.getElementById('playerCount');
const playersList = document.getElementById('playersList');
const startGameBtn = document.getElementById('startGameBtn');
const leaveLobbyBtn = document.getElementById('leaveLobbyBtn');

// Game Screen Elements
const questionNumber = document.getElementById('questionNumber');
const totalQuestions = document.getElementById('totalQuestions');
const timerBar = document.getElementById('timerBar');
const timerText = document.getElementById('timerText');
const playerScore = document.getElementById('playerScore');
const questionCategory = document.getElementById('questionCategory');
const questionDifficulty = document.getElementById('questionDifficulty');
const questionPoints = document.getElementById('questionPoints');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedbackMessage = document.getElementById('feedbackMessage');
const miniLeaderboard = document.getElementById('miniLeaderboard');

// Results Screen Elements
const winnerAnnouncement = document.getElementById('winnerAnnouncement');
const finalLeaderboard = document.getElementById('finalLeaderboard');
const playAgainBtn = document.getElementById('playAgainBtn');

// Event Listeners - Welcome Screen
createGameBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    showToast('Please enter your name', 'error');
    return;
  }

  socket.emit('createGame', {
    playerName,
    settings: {
      maxPlayers: 10,
      questionCount: 10,
      questionDuration: 15000
    }
  });
});

joinGameBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    showToast('Please enter your name', 'error');
    return;
  }

  joinGameForm.classList.remove('hidden');
});

joinGameSubmitBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  const gameId = gameIdInput.value.trim().toUpperCase();

  if (!playerName || !gameId) {
    showToast('Please enter your name and game ID', 'error');
    return;
  }

  socket.emit('joinGame', { gameId, playerName });
});

cancelJoinBtn.addEventListener('click', () => {
  joinGameForm.classList.add('hidden');
  gameIdInput.value = '';
});

// Event Listeners - Lobby Screen
startGameBtn.addEventListener('click', () => {
  socket.emit('startGame', { gameId: gameState.gameId });
});

leaveLobbyBtn.addEventListener('click', () => {
  location.reload();
});

// Event Listeners - Results Screen
playAgainBtn.addEventListener('click', () => {
  location.reload();
});

// Socket Event Handlers
socket.on('gameCreated', ({ gameId, playerId, gameInfo }) => {
  gameState.gameId = gameId;
  gameState.playerId = playerId;
  gameState.playerName = playerNameInput.value.trim();
  gameState.isHost = true;

  showScreen('lobby');
  updateLobby(gameInfo);
  startGameBtn.style.display = 'block';
  showToast(`Game created! ID: ${gameId}`, 'success');
});

socket.on('gameJoined', ({ gameId, playerId, gameInfo }) => {
  gameState.gameId = gameId;
  gameState.playerId = playerId;
  gameState.playerName = playerNameInput.value.trim();
  gameState.isHost = false;

  showScreen('lobby');
  updateLobby(gameInfo);
  showToast('Joined game successfully!', 'success');
});

socket.on('joinError', ({ error }) => {
  showToast(error, 'error');
});

socket.on('playerJoined', ({ player, players }) => {
  showToast(`${player.name} joined the game`, 'info');
  updatePlayersList(players);
});

socket.on('playerLeft', ({ playerName, players }) => {
  showToast(`${playerName} left the game`, 'info');
  if (players.length > 0) {
    updatePlayersList(players);
  } else {
    location.reload();
  }
});

socket.on('gameStarted', ({ totalQuestions: total }) => {
  showScreen('game');
  totalQuestions.textContent = total;
  showToast('Game starting!', 'success');
});

socket.on('newQuestion', (question) => {
  gameState.currentQuestion = question;
  gameState.questionStartTime = question.startTime;
  gameState.hasAnswered = false;

  displayQuestion(question);
  startTimer(question.duration);
});

socket.on('answerResult', ({ isCorrect, pointsEarned, correctAnswer }) => {
  showAnswerFeedback(isCorrect, pointsEarned, correctAnswer);
  gameState.score += pointsEarned;
  playerScore.textContent = gameState.score;
});

socket.on('leaderboardUpdate', ({ leaderboard }) => {
  updateLeaderboard(leaderboard);
});

socket.on('gameEnded', (results) => {
  showScreen('results');
  displayResults(results);
});

socket.on('error', ({ message }) => {
  showToast(message, 'error');
});

// Helper Functions
function showScreen(screenName) {
  Object.values(screens).forEach(screen => {
    screen.classList.remove('active');
  });
  screens[screenName].classList.add('active');
}

function updateLobby(gameInfo) {
  gameIdDisplay.textContent = gameInfo.gameId;
  updatePlayersList(gameInfo.players);
}

function updatePlayersList(players) {
  playerCount.textContent = players.length;
  playersList.innerHTML = players
    .map(player => `<li>${player.name}${player.id === gameState.playerId ? ' (You)' : ''}</li>`)
    .join('');
}

function displayQuestion(question) {
  // Update question info
  questionNumber.textContent = question.questionNumber;
  questionCategory.textContent = question.category;
  questionDifficulty.textContent = question.difficulty;
  questionDifficulty.className = `difficulty-badge ${question.difficulty}`;
  questionPoints.textContent = `${question.points} pts`;
  questionText.textContent = question.question;

  // Clear previous feedback
  feedbackMessage.classList.remove('show', 'correct', 'incorrect');
  feedbackMessage.textContent = '';

  // Create option buttons
  optionsContainer.innerHTML = question.options
    .map((option, index) => `
      <button class="option-btn" data-index="${index}">
        ${String.fromCharCode(65 + index)}. ${option}
      </button>
    `)
    .join('');

  // Add click handlers to options
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAnswerClick(btn));
  });
}

function handleAnswerClick(btn) {
  if (gameState.hasAnswered) return;

  const answerIndex = parseInt(btn.dataset.index);
  const answerTime = Date.now() - gameState.questionStartTime;

  // Mark as answered
  gameState.hasAnswered = true;

  // Highlight selected answer
  btn.classList.add('selected');

  // Disable all buttons
  document.querySelectorAll('.option-btn').forEach(b => {
    b.disabled = true;
  });

  // Submit answer
  socket.emit('submitAnswer', {
    gameId: gameState.gameId,
    answerIndex,
    answerTime
  });
}

function showAnswerFeedback(isCorrect, pointsEarned, correctAnswer) {
  const buttons = document.querySelectorAll('.option-btn');

  // Show correct answer
  buttons[correctAnswer].classList.add('correct');

  // Show incorrect answer if user was wrong
  const selectedBtn = document.querySelector('.option-btn.selected');
  if (selectedBtn && !isCorrect) {
    selectedBtn.classList.add('incorrect');
  }

  // Show feedback message
  feedbackMessage.classList.add('show', isCorrect ? 'correct' : 'incorrect');
  if (isCorrect) {
    feedbackMessage.textContent = `✓ Correct! +${pointsEarned} points`;
  } else {
    feedbackMessage.textContent = `✗ Incorrect. The correct answer was ${String.fromCharCode(65 + correctAnswer)}.`;
  }
}

function startTimer(duration) {
  const startTime = Date.now();
  const endTime = startTime + duration;

  const timerInterval = setInterval(() => {
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    const seconds = Math.ceil(remaining / 1000);

    // Update timer text
    timerText.textContent = `${seconds}s`;

    // Update timer bar
    const percentage = (remaining / duration) * 100;
    timerBar.style.width = `${percentage}%`;

    // Change color based on time remaining
    if (percentage < 30) {
      timerBar.style.background = '#f44336';
    } else if (percentage < 60) {
      timerBar.style.background = '#ff9800';
    } else {
      timerBar.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    if (remaining <= 0) {
      clearInterval(timerInterval);

      // Auto-submit if not answered
      if (!gameState.hasAnswered) {
        gameState.hasAnswered = true;
        document.querySelectorAll('.option-btn').forEach(b => {
          b.disabled = true;
        });
      }
    }
  }, 100);
}

function updateLeaderboard(leaderboard) {
  miniLeaderboard.innerHTML = leaderboard
    .slice(0, 5)
    .map((player, index) => {
      const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

      return `
        <div class="leaderboard-item">
          <span class="leaderboard-rank ${rankClass}">${medal || (index + 1)}</span>
          <span class="leaderboard-name">${player.name}${player.id === gameState.playerId ? ' (You)' : ''}</span>
          <span class="leaderboard-score">${player.score}</span>
        </div>
      `;
    })
    .join('');
}

function displayResults(results) {
  // Show winner announcement
  if (results.winner) {
    const isWinner = results.winner.id === gameState.playerId;
    winnerAnnouncement.innerHTML = isWinner
      ? `🎉 You Won! 🎉<br><small>Score: ${results.winner.score}</small>`
      : `👑 ${results.winner.name} Wins!<br><small>Score: ${results.winner.score}</small>`;
  }

  // Show final leaderboard
  finalLeaderboard.innerHTML = results.leaderboard
    .map((player, index) => {
      const rankClass = index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : '';
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;

      return `
        <div class="leaderboard-item">
          <span class="leaderboard-rank ${rankClass}">${medal}</span>
          <span class="leaderboard-name">
            ${player.name}${player.id === gameState.playerId ? ' (You)' : ''}
            <br>
            <small>${player.correctAnswers}/${results.totalQuestions} correct</small>
          </span>
          <span class="leaderboard-score">${player.score}</span>
        </div>
      `;
    })
    .join('');
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  const container = document.getElementById('toastContainer');
  container.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      container.removeChild(toast);
    }, 300);
  }, 3000);
}

// Initialize - focus on name input
playerNameInput.focus();
