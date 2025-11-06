// Question database with various categories and difficulty levels
// Now with database persistence!
const GameDatabase = require('./database');

// Default questions to seed the database
const defaultQuestions = [
  // Science Questions
  {
    question: "What is the chemical symbol for gold?",
    options: ["Au", "Ag", "Fe", "Cu"],
    correctAnswer: 0,
    category: "Science",
    difficulty: "easy",
    points: 100
  },
  {
    question: "What planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    category: "Science",
    difficulty: "easy",
    points: 100
  },
  {
    question: "What is the speed of light in vacuum?",
    options: ["299,792 km/s", "150,000 km/s", "400,000 km/s", "250,000 km/s"],
    correctAnswer: 0,
    category: "Science",
    difficulty: "medium",
    points: 200
  },
  {
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
    correctAnswer: 2,
    category: "Science",
    difficulty: "easy",
    points: 100
  },
  {
    question: "What is the atomic number of Carbon?",
    options: ["6", "12", "8", "14"],
    correctAnswer: 0,
    category: "Science",
    difficulty: "medium",
    points: 200
  },

  // Geography Questions
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    category: "Geography",
    difficulty: "easy",
    points: 100
  },
  {
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctAnswer: 3,
    category: "Geography",
    difficulty: "easy",
    points: 100
  },
  {
    question: "What is the longest river in the world?",
    options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
    correctAnswer: 1,
    category: "Geography",
    difficulty: "medium",
    points: 200
  },
  {
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
    category: "Geography",
    difficulty: "easy",
    points: 100
  },
  {
    question: "What is the smallest country in the world?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correctAnswer: 1,
    category: "Geography",
    difficulty: "medium",
    points: 200
  },

  // History Questions
  {
    question: "In what year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: 2,
    category: "History",
    difficulty: "easy",
    points: 100
  },
  {
    question: "Who was the first president of the United States?",
    options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"],
    correctAnswer: 1,
    category: "History",
    difficulty: "easy",
    points: 100
  },
  {
    question: "What year did the Titanic sink?",
    options: ["1910", "1911", "1912", "1913"],
    correctAnswer: 2,
    category: "History",
    difficulty: "medium",
    points: 200
  },
  {
    question: "Who wrote the Declaration of Independence?",
    options: ["George Washington", "John Adams", "Thomas Jefferson", "Benjamin Franklin"],
    correctAnswer: 2,
    category: "History",
    difficulty: "medium",
    points: 200
  },
  {
    question: "What ancient wonder was located in Alexandria?",
    options: ["Colossus", "Lighthouse", "Hanging Gardens", "Mausoleum"],
    correctAnswer: 1,
    category: "History",
    difficulty: "hard",
    points: 300
  },

  // Technology Questions
  {
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
    correctAnswer: 0,
    category: "Technology",
    difficulty: "easy",
    points: 100
  },
  {
    question: "Who is the founder of Microsoft?",
    options: ["Steve Jobs", "Bill Gates", "Elon Musk", "Mark Zuckerberg"],
    correctAnswer: 1,
    category: "Technology",
    difficulty: "easy",
    points: 100
  },
  {
    question: "What year was the first iPhone released?",
    options: ["2005", "2006", "2007", "2008"],
    correctAnswer: 2,
    category: "Technology",
    difficulty: "medium",
    points: 200
  },
  {
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Personal Unit", "Central Processor Unit", "Central Programming Unit"],
    correctAnswer: 0,
    category: "Technology",
    difficulty: "easy",
    points: 100
  },
  {
    question: "Which programming language is known as the 'language of the web'?",
    options: ["Python", "Java", "JavaScript", "C++"],
    correctAnswer: 2,
    category: "Technology",
    difficulty: "medium",
    points: 200
  },

  // Sports Questions
  {
    question: "How many players are on a soccer team?",
    options: ["9", "10", "11", "12"],
    correctAnswer: 2,
    category: "Sports",
    difficulty: "easy",
    points: 100
  },
  {
    question: "What sport is played at Wimbledon?",
    options: ["Golf", "Tennis", "Cricket", "Badminton"],
    correctAnswer: 1,
    category: "Sports",
    difficulty: "easy",
    points: 100
  },
  {
    question: "How many points is a touchdown worth in American football?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 1,
    category: "Sports",
    difficulty: "medium",
    points: 200
  },
  {
    question: "What is the diameter of a basketball hoop in inches?",
    options: ["16", "18", "20", "22"],
    correctAnswer: 1,
    category: "Sports",
    difficulty: "hard",
    points: 300
  },
  {
    question: "Which country won the FIFA World Cup in 2018?",
    options: ["Germany", "Brazil", "France", "Argentina"],
    correctAnswer: 2,
    category: "Sports",
    difficulty: "medium",
    points: 200
  }
];

class QuestionBank {
  constructor() {
    // Initialize database connection
    this.db = new GameDatabase();
    this.db.init();

    // Seed questions if database is empty
    this.seedIfNeeded();

    console.log('✓ QuestionBank initialized with database persistence');
  }

  // Seed questions into database if it's empty
  seedIfNeeded() {
    try {
      const count = this.db.db.prepare('SELECT COUNT(*) as count FROM questions').get();

      if (count.count === 0) {
        console.log('Database is empty, seeding default questions...');
        this.db.seedQuestions(defaultQuestions);
        console.log(`✓ Seeded ${defaultQuestions.length} questions into database`);
      }
    } catch (error) {
      console.error('Error checking/seeding questions:', error);
    }
  }

  // Get a random set of questions for a game session
  getQuestions(count = 10, difficulty = null, category = null) {
    try {
      // Database now handles filtering and randomization!
      return this.db.getQuestions(count, difficulty, category);
    } catch (error) {
      console.error('Error getting questions from database:', error);
      // Graceful fallback: return empty array
      return [];
    }
  }

  // Get a specific question by ID
  getQuestionById(id) {
    try {
      const row = this.db.db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
      if (!row) return null;

      return {
        id: row.id,
        question: row.question,
        options: JSON.parse(row.options),
        correctAnswer: row.correct_answer,
        category: row.category,
        difficulty: row.difficulty,
        points: row.points
      };
    } catch (error) {
      console.error('Error getting question by ID:', error);
      return null;
    }
  }

  // Get all unique categories
  getCategories() {
    try {
      const rows = this.db.db.prepare('SELECT DISTINCT category FROM questions ORDER BY category').all();
      return rows.map(row => row.category);
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }

  // Get all difficulty levels
  getDifficulties() {
    try {
      const rows = this.db.db.prepare('SELECT DISTINCT difficulty FROM questions ORDER BY difficulty').all();
      return rows.map(row => row.difficulty);
    } catch (error) {
      console.error('Error getting difficulties:', error);
      return ['easy', 'medium', 'hard']; // Fallback
    }
  }

  // Calculate points based on answer time
  calculatePoints(basePoints, answerTime, questionDuration = 15000) {
    // Faster answers get more points (up to 50% bonus)
    const timeBonus = Math.max(0, 1 - (answerTime / questionDuration)) * 0.5;
    return Math.round(basePoints * (1 + timeBonus));
  }
}

module.exports = QuestionBank;
