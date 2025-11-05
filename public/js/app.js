// Socket.io connection
const socket = io();

// Sound Manager
const soundManager = new SoundManager();

// Available avatars
const AVATARS = ['👤', '👨', '👩', '👦', '👧', '👨‍💻', '👩‍💻', '🧑‍🎓', '👨‍🎓', '👩‍🎓', '🧑‍🏫', '👨‍🏫', '👩‍🏫', '🦸', '🦹', '🧙', '🧚', '🧛', '🦊', '🐼', '🐨', '🦁', '🐯', '🐸'];

// Game state
let gameState = {
  gameId: null,
  playerId: null,
  playerName: null,
  playerAvatar: '👤',
  isHost: false,
  currentQuestion: null,
  questionStartTime: null,
  score: 0,
  hasAnswered: false,
  playerStats: null
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
const avatarGrid = document.getElementById('avatarGrid');
const createGameBtn = document.getElementById('createGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const joinGameForm = document.getElementById('joinGameForm');
const gameIdInput = document.getElementById('gameIdInput');
const joinGameSubmitBtn = document.getElementById('joinGameSubmitBtn');
const cancelJoinBtn = document.getElementById('cancelJoinBtn');
const gameSettings = document.getElementById('gameSettings');
const categorySelect = document.getElementById('categorySelect');
const difficultySelect = document.getElementById('difficultySelect');

// Lobby Screen Elements
const gameIdDisplay = document.getElementById('gameIdDisplay');
const gameSettingsDisplay = document.getElementById('gameSettingsDisplay');
const playerCount = document.getElementById('playerCount');
const playersList = document.getElementById('playersList');
const startGameBtn = document.getElementById('startGameBtn');
const leaveLobbyBtn = document.getElementById('leaveLobbyBtn');
const lobbyChatMessages = document.getElementById('lobbyChatMessages');
const lobbyChatInput = document.getElementById('lobbyChatInput');
const lobbyChatSend = document.getElementById('lobbyChatSend');

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
const gameChatMessages = document.getElementById('gameChatMessages');
const gameChatInput = document.getElementById('gameChatInput');
const gameChatSend = document.getElementById('gameChatSend');

// Results Screen Elements
const winnerAnnouncement = document.getElementById('winnerAnnouncement');
const finalLeaderboard = document.getElementById('finalLeaderboard');
const playerStatsDisplay = document.getElementById('playerStatsDisplay');
const playAgainBtn = document.getElementById('playAgainBtn');

// Sound & Stats Toggles
const soundToggle = document.getElementById('soundToggle');
const soundIcon = document.getElementById('soundIcon');
const statsToggle = document.getElementById('statsToggle');
const statsModal = document.getElementById('statsModal');
const statsModalClose = document.getElementById('statsModalClose');
const statsContent = document.getElementById('statsContent');

// Initialize Avatar Grid
function initAvatarGrid() {
  avatarGrid.innerHTML = AVATARS.map((avatar, index) => `
    <button class="avatar-option ${index === 0 ? 'selected' : ''}" data-avatar="${avatar}">
      ${avatar}
    </button>
  `).join('');

  // Add click handlers
  document.querySelectorAll('.avatar-option').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      gameState.playerAvatar = btn.dataset.avatar;
      soundManager.playClick();
    });
  });
}

// Event Listeners - Welcome Screen
createGameBtn.addEventListener('click', () => {
  soundManager.playClick();
  gameSettings.classList.toggle('hidden');
  if (!gameSettings.classList.contains('hidden')) {
    createGameBtn.textContent = 'Confirm & Create';
  } else {
    const playerName = playerNameInput.value.trim();
    if (!playerName) {
      showToast('Please enter your name', 'error');
      return;
    }

    socket.emit('createGame', {
      playerName,
      avatar: gameState.playerAvatar,
      settings: {
        maxPlayers: 10,
        questionCount: 10,
        questionDuration: 15000,
        category: categorySelect.value || null,
        difficulty: difficultySelect.value || null
      }
    });
  }
});

joinGameBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    showToast('Please enter your name', 'error');
    return;
  }

  soundManager.playClick();
  joinGameForm.classList.remove('hidden');
  gameIdInput.focus();
});

joinGameSubmitBtn.addEventListener('click', () => {
  const playerName = playerNameInput.value.trim();
  const gameId = gameIdInput.value.trim().toUpperCase();

  if (!playerName || !gameId) {
    showToast('Please enter your name and game ID', 'error');
    return;
  }

  soundManager.playClick();
  socket.emit('joinGame', {
    gameId,
    playerName,
    avatar: gameState.playerAvatar
  });
});

cancelJoinBtn.addEventListener('click', () => {
  soundManager.playClick();
  joinGameForm.classList.add('hidden');
  gameIdInput.value = '';
});

// Event Listeners - Lobby Screen
startGameBtn.addEventListener('click', () => {
  soundManager.playClick();
  socket.emit('startGame', { gameId: gameState.gameId });
});

leaveLobbyBtn.addEventListener('click', () => {
  soundManager.playClick();
  location.reload();
});

// Chat functionality - Lobby
lobbyChatSend.addEventListener('click', () => sendChatMessage(lobbyChatInput));
lobbyChatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChatMessage(lobbyChatInput);
});

// Chat functionality - Game
gameChatSend.addEventListener('click', () => sendChatMessage(gameChatInput));
gameChatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChatMessage(gameChatInput);
});

function sendChatMessage(inputElement) {
  const message = inputElement.value.trim();
  if (!message || !gameState.gameId) return;

  socket.emit('chatMessage', {
    gameId: gameState.gameId,
    message: message
  });

  inputElement.value = '';
}

// Event Listeners - Results Screen
playAgainBtn.addEventListener('click', () => {
  soundManager.playClick();
  location.reload();
});

// Sound toggle
soundToggle.addEventListener('click', () => {
  const enabled = soundManager.toggle();
  soundIcon.textContent = enabled ? '🔊' : '🔇';
  soundToggle.classList.toggle('muted', !enabled);
  showToast(enabled ? 'Sound enabled' : 'Sound disabled', 'info');
});

// Stats modal
statsToggle.addEventListener('click', () => {
  soundManager.playClick();
  socket.emit('getStats', { playerId: gameState.playerId });
  statsModal.classList.add('active');
});

statsModalClose.addEventListener('click', () => {
  soundManager.playClick();
  statsModal.classList.remove('active');
});

statsModal.addEventListener('click', (e) => {
  if (e.target === statsModal) {
    statsModal.classList.remove('active');
  }
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
  soundManager.playJoin();
});

socket.on('gameJoined', ({ gameId, playerId, gameInfo }) => {
  gameState.gameId = gameId;
  gameState.playerId = playerId;
  gameState.playerName = playerNameInput.value.trim();
  gameState.isHost = false;

  showScreen('lobby');
  updateLobby(gameInfo);
  showToast('Joined game successfully!', 'success');
  soundManager.playJoin();
});

socket.on('joinError', ({ error }) => {
  showToast(error, 'error');
  soundManager.playIncorrect();
});

socket.on('playerJoined', ({ player, players }) => {
  showToast(`${player.name} joined the game`, 'info');
  updatePlayersList(players);
  soundManager.playJoin();
});

socket.on('playerLeft', ({ playerName, players }) => {
  showToast(`${playerName} left the game`, 'info');
  if (players.length > 0) {
    updatePlayersList(players);
  } else {
    location.reload();
  }
  soundManager.playLeave();
});

socket.on('gameStarted', ({ totalQuestions: total }) => {
  showScreen('game');
  totalQuestions.textContent = total;
  showToast('Game starting!', 'success');
  soundManager.playGameStart();
});

socket.on('newQuestion', (question) => {
  gameState.currentQuestion = question;
  gameState.questionStartTime = question.startTime;
  gameState.hasAnswered = false;

  displayQuestion(question);
  startTimer(question.duration);
  soundManager.playNewQuestion();
});

socket.on('answerResult', ({ isCorrect, pointsEarned, correctAnswer }) => {
  showAnswerFeedback(isCorrect, pointsEarned, correctAnswer);
  gameState.score += pointsEarned;
  playerScore.textContent = gameState.score;

  if (isCorrect) {
    soundManager.playCorrect();
  } else {
    soundManager.playIncorrect();
  }
});

socket.on('leaderboardUpdate', ({ leaderboard }) => {
  updateLeaderboard(leaderboard);
});

socket.on('gameEnded', (results) => {
  showScreen('results');
  displayResults(results);
  soundManager.playVictory();
});

socket.on('chatMessage', (chatMessage) => {
  displayChatMessage(chatMessage);
  soundManager.playChatMessage();
});

socket.on('statsUpdated', ({ stats }) => {
  gameState.playerStats = stats;
});

socket.on('playerStats', ({ stats }) => {
  displayPlayerStats(stats);
});

socket.on('error', ({ message }) => {
  showToast(message, 'error');
  soundManager.playIncorrect();
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

  // Display game settings
  const settings = [];
  if (gameInfo.category) settings.push(`Category: ${gameInfo.category}`);
  if (gameInfo.difficulty) settings.push(`Difficulty: ${gameInfo.difficulty}`);
  gameSettingsDisplay.textContent = settings.length ? settings.join(' | ') : 'All Categories & Difficulties';

  updatePlayersList(gameInfo.players);
}

function updatePlayersList(players) {
  playerCount.textContent = players.length;
  playersList.innerHTML = players
    .map(player => `
      <li>
        <span class="player-avatar">${player.avatar || '👤'}</span>
        <span class="player-name">${player.name}${player.id === gameState.playerId ? ' (You)' : ''}</span>
      </li>
    `)
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
  soundManager.playClick();

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

let timerWarningPlayed = false;

function startTimer(duration) {
  const startTime = Date.now();
  const endTime = startTime + duration;
  timerWarningPlayed = false;

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
      // Play warning sound at 5 seconds
      if (seconds === 5 && !timerWarningPlayed) {
        soundManager.playTimerWarning();
        timerWarningPlayed = true;
      }
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
          <div class="leaderboard-left">
            <span class="leaderboard-rank ${rankClass}">${medal || (index + 1)}</span>
            <span class="leaderboard-avatar">${player.avatar || '👤'}</span>
            <span class="leaderboard-name">${player.name}${player.id === gameState.playerId ? ' (You)' : ''}</span>
          </div>
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
          <div class="leaderboard-left">
            <span class="leaderboard-rank ${rankClass}">${medal}</span>
            <span class="leaderboard-avatar">${player.avatar || '👤'}</span>
            <span class="leaderboard-name">
              ${player.name}${player.id === gameState.playerId ? ' (You)' : ''}
              <br>
              <small>${player.correctAnswers}/${results.totalQuestions} correct</small>
            </span>
          </div>
          <span class="leaderboard-score">${player.score}</span>
        </div>
      `;
    })
    .join('');

  // Display player stats if available
  if (gameState.playerStats) {
    displayGameStats(gameState.playerStats);
  }
}

function displayGameStats(stats) {
  playerStatsDisplay.innerHTML = `
    <h3>Your Statistics</h3>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-value">${stats.totalGames}</div>
        <div class="stat-card-label">Total Games</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${stats.wins}</div>
        <div class="stat-card-label">Wins</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${stats.winRate}%</div>
        <div class="stat-card-label">Win Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${stats.accuracy}%</div>
        <div class="stat-card-label">Accuracy</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${stats.bestScore}</div>
        <div class="stat-card-label">Best Score</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-value">${stats.averageScore}</div>
        <div class="stat-card-label">Avg Score</div>
      </div>
    </div>
  `;
}

function displayPlayerStats(stats) {
  statsContent.innerHTML = `
    <div class="stat-section">
      <h3>Overall Performance</h3>
      <div class="stat-row">
        <span class="stat-label">Total Games Played</span>
        <span class="stat-value">${stats.totalGames}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Wins</span>
        <span class="stat-value">${stats.wins}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Win Rate</span>
        <span class="stat-value">${stats.winRate}%</span>
      </div>
    </div>

    <div class="stat-section">
      <h3>Score Statistics</h3>
      <div class="stat-row">
        <span class="stat-label">Best Score</span>
        <span class="stat-value">${stats.bestScore}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Average Score</span>
        <span class="stat-value">${stats.averageScore}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Total Score</span>
        <span class="stat-value">${stats.totalScore}</span>
      </div>
    </div>

    <div class="stat-section">
      <h3>Question Stats</h3>
      <div class="stat-row">
        <span class="stat-label">Correct Answers</span>
        <span class="stat-value">${stats.totalCorrectAnswers} / ${stats.totalQuestions}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">Accuracy</span>
        <span class="stat-value">${stats.accuracy}%</span>
      </div>
      ${stats.fastestAnswer ? `
        <div class="stat-row">
          <span class="stat-label">Fastest Answer</span>
          <span class="stat-value">${(stats.fastestAnswer / 1000).toFixed(2)}s</span>
        </div>
      ` : ''}
    </div>

    ${Object.keys(stats.categoriesPlayed).length > 0 ? `
      <div class="stat-section">
        <h3>Categories Played</h3>
        ${Object.entries(stats.categoriesPlayed).map(([cat, count]) => `
          <div class="stat-row">
            <span class="stat-label">${cat}</span>
            <span class="stat-value">${count}</span>
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function displayChatMessage(chatMessage) {
  const container = gameState.gameId && screens.game.classList.contains('active')
    ? gameChatMessages
    : lobbyChatMessages;

  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message';

  const time = new Date(chatMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  messageEl.innerHTML = `
    <div class="chat-message-header">
      <span class="chat-message-avatar">${chatMessage.avatar || '👤'}</span>
      <span class="chat-message-name">${chatMessage.playerName}</span>
      <span class="chat-message-time">${time}</span>
    </div>
    <div class="chat-message-text">${escapeHtml(chatMessage.message)}</div>
  `;

  container.appendChild(messageEl);
  container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

// Initialize
initAvatarGrid();
playerNameInput.focus();
