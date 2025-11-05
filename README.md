# 🎮 Real-Time Multiplayer Quiz Game

A competitive real-time quiz game where multiple players answer questions simultaneously, with live scoring, dynamic leaderboards, and instant feedback. Built with Node.js, Express, and Socket.io for seamless real-time multiplayer experience.

## ✨ Features

### 🎯 Real-Time Multiplayer
- **Simultaneous Gameplay**: Multiple players answer questions at the same time
- **Live Updates**: Instant synchronization of game state across all players
- **Game Rooms**: Create or join games with unique game IDs
- **Player Lobby**: See who's in the game before it starts

### 🏆 Advanced Scoring System
- **Speed-Based Bonus**: Faster answers earn up to 50% bonus points
- **Difficulty Levels**: Easy (100 pts), Medium (200 pts), Hard (300 pts)
- **Real-Time Score Updates**: Watch scores update instantly as players answer
- **Live Leaderboard**: See your ranking change in real-time

### 📊 Question System
- **25 Diverse Questions**: Covering 5 categories
  - Science
  - Geography
  - History
  - Technology
  - Sports
- **Multiple Difficulty Levels**: Easy, Medium, and Hard questions
- **Random Selection**: Different question sets each game
- **Timed Questions**: 15 seconds per question

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Beautiful Animations**: Smooth transitions and feedback
- **Visual Feedback**: Color-coded correct/incorrect answers
- **Progress Indicators**: Timer bar and question counter
- **Toast Notifications**: Real-time game events

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
2. Click "Create New Game"
3. Share the generated Game ID with friends
4. Wait for players to join in the lobby
5. Click "Start Game" when ready

### Joining a Game
1. Enter your name on the welcome screen
2. Click "Join Game"
3. Enter the Game ID provided by the host
4. Wait in the lobby for the host to start

### During Gameplay
1. Read each question carefully
2. Click your answer choice
3. Faster correct answers earn more points
4. Watch the live leaderboard update
5. Compete to reach the top!

### Scoring
- **Base Points**: Based on question difficulty (100-300 pts)
- **Speed Bonus**: Up to 50% extra for fast answers
- **Example**: Answer a 200-point question in 3 seconds → ~260 points!

## 📁 Project Structure

```
real-time-multiplayer-quiz-game/
├── server/
│   ├── index.js           # Main server with Socket.io
│   ├── gameManager.js     # Game state and room management
│   └── questionBank.js    # Question database and logic
├── public/
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── style.css      # Styling and animations
│   └── js/
│       └── app.js         # Client-side game logic
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🛠️ Technical Details

### Backend
- **Express**: Web server and static file serving
- **Socket.io**: Real-time bidirectional communication
- **Game Manager**: Handles game rooms, players, and state
- **Question Bank**: 25 questions with multiple categories

### Frontend
- **Vanilla JavaScript**: No framework dependencies
- **Socket.io Client**: Real-time server communication
- **CSS Grid & Flexbox**: Responsive layout
- **Custom Animations**: Smooth transitions and feedback

### Real-Time Events
- `createGame`: Host creates a new game room
- `joinGame`: Player joins existing game
- `startGame`: Host starts the quiz
- `submitAnswer`: Player submits an answer
- `newQuestion`: Server sends next question
- `leaderboardUpdate`: Real-time score updates
- `gameEnded`: Final results and winner

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

## 🎉 Future Enhancements

Potential features to add:
- [ ] Question categories selection
- [ ] Difficulty level selection
- [ ] Custom question sets
- [ ] Player avatars
- [ ] Sound effects
- [ ] Chat functionality
- [ ] Game replay
- [ ] Statistics tracking
- [ ] Achievement system
- [ ] Power-ups and bonuses

## 💡 Tips for Best Experience

1. **Stable Connection**: Use a reliable internet connection
2. **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
3. **Multiple Players**: More players = more fun!
4. **Quick Answers**: Speed matters for bonus points
5. **Read Carefully**: Some questions are tricky!

---

**Enjoy the game! May the fastest quiz master win! 🏆**
