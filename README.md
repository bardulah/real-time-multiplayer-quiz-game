# 🎮 Real-Time Multiplayer Quiz Game

A competitive real-time quiz game where multiple players answer questions simultaneously, with live scoring, dynamic leaderboards, real-time chat, player avatars, sound effects, and comprehensive statistics tracking. Built with Node.js, Express, and Socket.io for a seamless real-time multiplayer experience.

## ✨ Features

### 🎯 Real-Time Multiplayer
- **Simultaneous Gameplay**: Multiple players answer questions at the same time
- **Live Updates**: Instant synchronization of game state across all players
- **Game Rooms**: Create or join games with unique game IDs
- **Player Lobby**: See who's in the game before it starts
- **Player Avatars**: Choose from 24 different emoji avatars

### 🏆 Advanced Scoring System
- **Speed-Based Bonus**: Faster answers earn up to 50% bonus points
- **Difficulty Levels**: Easy (100 pts), Medium (200 pts), Hard (300 pts)
- **Real-Time Score Updates**: Watch scores update instantly as players answer
- **Live Leaderboard**: See your ranking change in real-time with avatars

### 📊 Question System
- **25 Diverse Questions**: Covering 5 categories
  - Science
  - Geography
  - History
  - Technology
  - Sports
- **Category Selection**: Host can choose specific category or mixed
- **Difficulty Selection**: Choose easy, medium, hard, or mixed difficulty
- **Random Selection**: Different question sets each game
- **Timed Questions**: 15 seconds per question

### 💬 Real-Time Chat
- **Lobby Chat**: Chat with players while waiting for game to start
- **In-Game Chat**: Continue chatting during gameplay
- **Message History**: Scrollable chat with timestamps
- **Player Avatars**: See who's talking with avatar icons

### 📈 Statistics Tracking
- **Persistent Stats**: Track performance across multiple games
- **Win Rate**: See your wins vs total games played
- **Accuracy**: Track percentage of correct answers
- **Best Score**: Record your highest score ever
- **Average Score**: Monitor your average performance
- **Fastest Answer**: Track your quickest correct response
- **Category Stats**: See which categories you play most
- **Game History**: Review your last 10 games

### 🔊 Sound Effects
- **Game Events**: Audio feedback for joins, leaves, and game start
- **Answer Feedback**: Different sounds for correct/incorrect answers
- **Timer Warning**: Alert when time is running low
- **Chat Notifications**: Sound when new messages arrive
- **Victory Music**: Celebratory tune when game ends
- **Toggle Control**: Mute/unmute with one click

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Beautiful Animations**: Smooth transitions and feedback
- **Visual Feedback**: Color-coded correct/incorrect answers
- **Progress Indicators**: Timer bar and question counter
- **Toast Notifications**: Real-time game events
- **Modal Statistics**: View detailed stats anytime
- **Avatar Grid**: Interactive avatar selection interface
- **Chat Interface**: Integrated messaging with auto-scroll

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd real-time-multiplayer-quiz-game
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### For Development
Use nodemon for auto-restart on file changes:
```bash
npm run dev
```

## 🎮 How to Play

### Creating a Game
1. Enter your name on the welcome screen
2. **Choose your avatar** from 24 emoji options
3. Click "Create New Game"
4. **Optional**: Configure game settings
   - Select a specific category (or keep mixed)
   - Choose difficulty level (or keep mixed)
5. Click "Confirm & Create" to finalize settings
6. Share the generated Game ID with friends
7. **Chat with players** as they join the lobby
8. Click "Start Game" when ready

### Joining a Game
1. Enter your name on the welcome screen
2. **Choose your avatar** from the selection grid
3. Click "Join Game"
4. Enter the Game ID provided by the host
5. Wait in the lobby and **chat with other players**
6. Game starts when host clicks "Start Game"

### During Gameplay
1. Read each question carefully
2. Click your answer choice quickly (faster = more points!)
3. **Hear sound effects** for correct/incorrect answers
4. **Use the chat** to communicate with other players
5. Watch the live leaderboard update with player avatars
6. Timer bar changes color as time runs out (warning at 5 seconds)
7. Compete to reach the top!

### After the Game
- View final leaderboard with rankings
- **Check your updated statistics** (wins, accuracy, scores)
- See your performance summary
- Click "Play Again" to start a new game

### Using Features

#### Sound Effects
- Click the **🔊 button** (top-right) to toggle sound on/off
- Sounds play for: answers, chat, timer warnings, game events

#### Statistics
- Click the **📊 button** (top-right) to view your stats anytime
- Stats include: total games, wins, win rate, accuracy, best score, and more
- Statistics persist across multiple games

#### Chat
- Available in both lobby and during gameplay
- Type message and press Enter or click Send
- See player avatars and timestamps
- Auto-scrolls to latest messages

### Scoring
- **Base Points**: Based on question difficulty (100-300 pts)
- **Speed Bonus**: Up to 50% extra for fast answers
- **Example**: Answer a 200-point question in 3 seconds → ~260 points!
- **Strategy**: Balance speed with accuracy for maximum points

## 📁 Project Structure

```
real-time-multiplayer-quiz-game/
├── server/
│   ├── index.js           # Main server with Socket.io
│   ├── gameManager.js     # Game state and room management
│   ├── questionBank.js    # Question database and logic
│   └── statsTracker.js    # Statistics tracking system
├── public/
│   ├── index.html         # Main HTML file with all features
│   ├── css/
│   │   └── style.css      # Comprehensive styling and animations
│   └── js/
│       ├── app.js         # Client-side game logic
│       └── soundManager.js # Sound effects manager (Web Audio API)
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🛠️ Technical Details

### Backend
- **Express**: Web server and static file serving
- **Socket.io**: Real-time bidirectional communication
- **Game Manager**: Handles game rooms, players, state, and chat
- **Question Bank**: 25 questions with category/difficulty filtering
- **Stats Tracker**: Persistent player statistics across games

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **Socket.io Client**: Real-time server communication
- **Web Audio API**: Programmatic sound effect generation
- **CSS Grid & Flexbox**: Responsive layout
- **Custom Animations**: Smooth transitions and feedback
- **Modal System**: Statistics and settings overlays

### Real-Time Events
- `createGame`: Host creates a new game room with settings
- `joinGame`: Player joins existing game with avatar
- `startGame`: Host starts the quiz
- `submitAnswer`: Player submits an answer
- `newQuestion`: Server sends next question
- `leaderboardUpdate`: Real-time score updates with avatars
- `chatMessage`: Real-time chat messages
- `gameEnded`: Final results, winner, and stats update
- `getStats`: Request player statistics
- `statsUpdated`: Receive updated statistics

## 🎯 Game Mechanics

### Question Flow
1. Question appears with timer
2. Players have 15 seconds to answer
3. Instant feedback on correctness
4. 3-second delay before next question
5. Automatic progression through all questions

### Timer System
- Visual progress bar
- Color changes: Green → Orange → Red
- Auto-submit when time expires
- Speed affects point calculation

### Leaderboard Updates
- Updates after each answer submission
- Top 5 players shown during gameplay
- Full leaderboard in final results
- Medals for top 3 finishers 🥇🥈🥉

## 🔧 Configuration

### Game Settings (customizable in `public/js/app.js`)
```javascript
settings: {
  maxPlayers: 10,          // Maximum players per game
  questionCount: 10,       // Questions per game
  questionDuration: 15000  // Time per question (ms)
}
```

### Server Port
Change in `server/index.js` or set environment variable:
```bash
PORT=3000 npm start
```

## 🌟 Features Breakdown

### Real-Time Communication
- WebSocket connection for instant updates
- Automatic reconnection handling
- Event-based architecture
- Minimal latency

### Game State Management
- Centralized state on server
- Player tracking and scoring
- Question progression
- Room lifecycle management

### User Experience
- Intuitive interface
- Immediate visual feedback
- Responsive controls
- Smooth animations

## 📝 Adding More Questions

Edit `server/questionBank.js` to add questions:

```javascript
{
  id: 26,
  question: "Your question here?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correctAnswer: 0,  // Index of correct answer (0-3)
  category: "Category Name",
  difficulty: "easy",  // easy, medium, or hard
  points: 100  // 100, 200, or 300
}
```

## 🎨 Customization

### Styling
- Modify `public/css/style.css` for visual changes
- Color scheme uses CSS variables
- Easy to theme and customize

### Game Logic
- Adjust timing in `server/gameManager.js`
- Modify point calculations in `server/questionBank.js`
- Change question selection logic

## 🚦 Development

### Running Tests
```bash
# Start server
npm start

# Open multiple browser tabs to http://localhost:3000
# Test multiplayer functionality
```

### Code Structure
- **Modular Design**: Separate concerns (server, game logic, questions)
- **Event-Driven**: Socket.io events for all interactions
- **State Management**: Centralized game state on server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and development!

## ✅ Recently Implemented Features

These features have been added in the latest version:
- [x] **Question categories selection** - Host can filter by category
- [x] **Difficulty level selection** - Choose easy, medium, hard, or mixed
- [x] **Player avatars** - 24 emoji avatars to choose from
- [x] **Sound effects** - Web Audio API-powered sound feedback
- [x] **Chat functionality** - Real-time messaging in lobby and game
- [x] **Statistics tracking** - Persistent stats across games

## 🎉 Future Enhancements

Potential features to add:
- [ ] Custom question sets - Upload your own questions
- [ ] Game replay - Review past games move-by-move
- [ ] Achievement system - Unlock badges and rewards
- [ ] Power-ups and bonuses - Special abilities during gameplay
- [ ] Team mode - Compete in teams
- [ ] Tournament brackets - Multi-round competitions
- [ ] Custom themes - Personalize the UI appearance
- [ ] Question editor - In-game question management
- [ ] Private rooms - Password-protected games
- [ ] Spectator mode - Watch games without playing

## 💡 Tips for Best Experience

1. **Stable Connection**: Use a reliable internet connection for smooth real-time updates
2. **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions) for best compatibility
3. **Enable Sound**: Turn on sound effects for better feedback and immersion
4. **Choose Your Avatar**: Pick an avatar that represents you before joining
5. **Use Chat**: Communicate with other players for a more social experience
6. **Multiple Players**: More players = more competitive and fun!
7. **Quick Answers**: Speed matters for bonus points - be fast but accurate
8. **Check Stats**: Review your statistics to track improvement over time
9. **Read Carefully**: Some questions are tricky - accuracy counts!
10. **Category Selection**: Host can choose specific categories for themed games

---

**Enjoy the game! May the fastest quiz master win! 🏆**
