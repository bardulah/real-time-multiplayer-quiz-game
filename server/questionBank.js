// Question database with various categories and difficulty levels
const questions = [
  // Science Questions
  {
    id: 1,
    question: "What is the chemical symbol for gold?",
    options: ["Au", "Ag", "Fe", "Cu"],
    correctAnswer: 0,
    category: "Science",
    difficulty: "easy",
    points: 100
  },
  {
    id: 2,
    question: "What planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: 1,
    category: "Science",
    difficulty: "easy",
    points: 100
  },
  {
    id: 3,
    question: "What is the speed of light in vacuum?",
    options: ["299,792 km/s", "150,000 km/s", "400,000 km/s", "250,000 km/s"],
    correctAnswer: 0,
    category: "Science",
    difficulty: "medium",
    points: 200
  },
  {
    id: 4,
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"],
    correctAnswer: 2,
    category: "Science",
    difficulty: "easy",
    points: 100
  },
  {
    id: 5,
    question: "What is the atomic number of Carbon?",
    options: ["6", "12", "8", "14"],
    correctAnswer: 0,
    category: "Science",
    difficulty: "medium",
    points: 200
  },

  // Geography Questions
  {
    id: 6,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correctAnswer: 2,
    category: "Geography",
    difficulty: "easy",
    points: 100
  },
  {
    id: 7,
    question: "Which is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctAnswer: 3,
    category: "Geography",
    difficulty: "easy",
    points: 100
  },
  {
    id: 8,
    question: "What is the longest river in the world?",
    options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
    correctAnswer: 1,
    category: "Geography",
    difficulty: "medium",
    points: 200
  },
  {
    id: 9,
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
    category: "Geography",
    difficulty: "easy",
    points: 100
  },
  {
    id: 10,
    question: "What is the smallest country in the world?",
    options: ["Monaco", "Vatican City", "San Marino", "Liechtenstein"],
    correctAnswer: 1,
    category: "Geography",
    difficulty: "medium",
    points: 200
  },

  // History Questions
  {
    id: 11,
    question: "In what year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: 2,
    category: "History",
    difficulty: "easy",
    points: 100
  },
  {
    id: 12,
    question: "Who was the first president of the United States?",
    options: ["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"],
    correctAnswer: 1,
    category: "History",
    difficulty: "easy",
    points: 100
  },
  {
    id: 13,
    question: "What year did the Titanic sink?",
    options: ["1910", "1911", "1912", "1913"],
    correctAnswer: 2,
    category: "History",
    difficulty: "medium",
    points: 200
  },
  {
    id: 14,
    question: "Who wrote the Declaration of Independence?",
    options: ["George Washington", "John Adams", "Thomas Jefferson", "Benjamin Franklin"],
    correctAnswer: 2,
    category: "History",
    difficulty: "medium",
    points: 200
  },
  {
    id: 15,
    question: "What ancient wonder was located in Alexandria?",
    options: ["Colossus", "Lighthouse", "Hanging Gardens", "Mausoleum"],
    correctAnswer: 1,
    category: "History",
    difficulty: "hard",
    points: 300
  },

  // Technology Questions
  {
    id: 16,
    question: "What does HTML stand for?",
    options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"],
    correctAnswer: 0,
    category: "Technology",
    difficulty: "easy",
    points: 100
  },
  {
    id: 17,
    question: "Who is the founder of Microsoft?",
    options: ["Steve Jobs", "Bill Gates", "Elon Musk", "Mark Zuckerberg"],
    correctAnswer: 1,
    category: "Technology",
    difficulty: "easy",
    points: 100
  },
  {
    id: 18,
    question: "What year was the first iPhone released?",
    options: ["2005", "2006", "2007", "2008"],
    correctAnswer: 2,
    category: "Technology",
    difficulty: "medium",
    points: 200
  },
  {
    id: 19,
    question: "What does CPU stand for?",
    options: ["Central Processing Unit", "Computer Personal Unit", "Central Processor Unit", "Central Programming Unit"],
    correctAnswer: 0,
    category: "Technology",
    difficulty: "easy",
    points: 100
  },
  {
    id: 20,
    question: "Which programming language is known as the 'language of the web'?",
    options: ["Python", "Java", "JavaScript", "C++"],
    correctAnswer: 2,
    category: "Technology",
    difficulty: "medium",
    points: 200
  },

  // Sports Questions
  {
    id: 21,
    question: "How many players are on a soccer team?",
    options: ["9", "10", "11", "12"],
    correctAnswer: 2,
    category: "Sports",
    difficulty: "easy",
    points: 100
  },
  {
    id: 22,
    question: "What sport is played at Wimbledon?",
    options: ["Golf", "Tennis", "Cricket", "Badminton"],
    correctAnswer: 1,
    category: "Sports",
    difficulty: "easy",
    points: 100
  },
  {
    id: 23,
    question: "How many points is a touchdown worth in American football?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 1,
    category: "Sports",
    difficulty: "medium",
    points: 200
  },
  {
    id: 24,
    question: "What is the diameter of a basketball hoop in inches?",
    options: ["16", "18", "20", "22"],
    correctAnswer: 1,
    category: "Sports",
    difficulty: "hard",
    points: 300
  },
  {
    id: 25,
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
    this.questions = questions;
    this.usedQuestions = new Set();
  }

  // Get a random set of questions for a game session
  getQuestions(count = 10, difficulty = null, category = null) {
    let availableQuestions = [...this.questions];

    // Filter by difficulty if specified
    if (difficulty) {
      availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty);
    }

    // Filter by category if specified
    if (category) {
      availableQuestions = availableQuestions.filter(q => q.category === category);
    }

    // Shuffle and select questions
    const shuffled = this.shuffleArray(availableQuestions);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // Get a specific question by ID
  getQuestionById(id) {
    return this.questions.find(q => q.id === id);
  }

  // Shuffle array helper
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  // Get all unique categories
  getCategories() {
    return [...new Set(this.questions.map(q => q.category))];
  }

  // Get all difficulty levels
  getDifficulties() {
    return [...new Set(this.questions.map(q => q.difficulty))];
  }

  // Calculate points based on answer time
  calculatePoints(basePoints, answerTime, questionDuration = 15000) {
    // Faster answers get more points (up to 50% bonus)
    const timeBonus = Math.max(0, 1 - (answerTime / questionDuration)) * 0.5;
    return Math.round(basePoints * (1 + timeBonus));
  }
}

module.exports = QuestionBank;
