import { getDatabase } from './index';
import logger from '../utils/logger';

const initialQuestions = [
  // Science Questions
  { question: "What is the chemical symbol for gold?", options: JSON.stringify(["Au", "Ag", "Fe", "Cu"]), correctAnswer: 0, category: "Science", difficulty: "easy", points: 100 },
  { question: "What planet is known as the Red Planet?", options: JSON.stringify(["Venus", "Mars", "Jupiter", "Saturn"]), correctAnswer: 1, category: "Science", difficulty: "easy", points: 100 },
  { question: "What is the speed of light in vacuum?", options: JSON.stringify(["299,792 km/s", "150,000 km/s", "400,000 km/s", "250,000 km/s"]), correctAnswer: 0, category: "Science", difficulty: "medium", points: 200 },
  { question: "What is the powerhouse of the cell?", options: JSON.stringify(["Nucleus", "Ribosome", "Mitochondria", "Chloroplast"]), correctAnswer: 2, category: "Science", difficulty: "easy", points: 100 },
  { question: "What is the atomic number of Carbon?", options: JSON.stringify(["6", "12", "8", "14"]), correctAnswer: 0, category: "Science", difficulty: "medium", points: 200 },

  // Geography Questions
  { question: "What is the capital of France?", options: JSON.stringify(["London", "Berlin", "Paris", "Madrid"]), correctAnswer: 2, category: "Geography", difficulty: "easy", points: 100 },
  { question: "Which is the largest ocean on Earth?", options: JSON.stringify(["Atlantic", "Indian", "Arctic", "Pacific"]), correctAnswer: 3, category: "Geography", difficulty: "easy", points: 100 },
  { question: "What is the longest river in the world?", options: JSON.stringify(["Amazon", "Nile", "Mississippi", "Yangtze"]), correctAnswer: 1, category: "Geography", difficulty: "medium", points: 200 },
  { question: "How many continents are there?", options: JSON.stringify(["5", "6", "7", "8"]), correctAnswer: 2, category: "Geography", difficulty: "easy", points: 100 },
  { question: "What is the smallest country in the world?", options: JSON.stringify(["Monaco", "Vatican City", "San Marino", "Liechtenstein"]), correctAnswer: 1, category: "Geography", difficulty: "medium", points: 200 },

  // History Questions
  { question: "In what year did World War II end?", options: JSON.stringify(["1943", "1944", "1945", "1946"]), correctAnswer: 2, category: "History", difficulty: "easy", points: 100 },
  { question: "Who was the first president of the United States?", options: JSON.stringify(["Thomas Jefferson", "George Washington", "John Adams", "Benjamin Franklin"]), correctAnswer: 1, category: "History", difficulty: "easy", points: 100 },
  { question: "What year did the Titanic sink?", options: JSON.stringify(["1910", "1911", "1912", "1913"]), correctAnswer: 2, category: "History", difficulty: "medium", points: 200 },
  { question: "Who wrote the Declaration of Independence?", options: JSON.stringify(["George Washington", "John Adams", "Thomas Jefferson", "Benjamin Franklin"]), correctAnswer: 2, category: "History", difficulty: "medium", points: 200 },
  { question: "What ancient wonder was located in Alexandria?", options: JSON.stringify(["Colossus", "Lighthouse", "Hanging Gardens", "Mausoleum"]), correctAnswer: 1, category: "History", difficulty: "hard", points: 300 },

  // Technology Questions
  { question: "What does HTML stand for?", options: JSON.stringify(["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"]), correctAnswer: 0, category: "Technology", difficulty: "easy", points: 100 },
  { question: "Who is the founder of Microsoft?", options: JSON.stringify(["Steve Jobs", "Bill Gates", "Elon Musk", "Mark Zuckerberg"]), correctAnswer: 1, category: "Technology", difficulty: "easy", points: 100 },
  { question: "What year was the first iPhone released?", options: JSON.stringify(["2005", "2006", "2007", "2008"]), correctAnswer: 2, category: "Technology", difficulty: "medium", points: 200 },
  { question: "What does CPU stand for?", options: JSON.stringify(["Central Processing Unit", "Computer Personal Unit", "Central Processor Unit", "Central Programming Unit"]), correctAnswer: 0, category: "Technology", difficulty: "easy", points: 100 },
  { question: "Which programming language is known as the 'language of the web'?", options: JSON.stringify(["Python", "Java", "JavaScript", "C++"]), correctAnswer: 2, category: "Technology", difficulty: "medium", points: 200 },

  // Sports Questions
  { question: "How many players are on a soccer team?", options: JSON.stringify(["9", "10", "11", "12"]), correctAnswer: 2, category: "Sports", difficulty: "easy", points: 100 },
  { question: "What sport is played at Wimbledon?", options: JSON.stringify(["Golf", "Tennis", "Cricket", "Badminton"]), correctAnswer: 1, category: "Sports", difficulty: "easy", points: 100 },
  { question: "How many points is a touchdown worth in American football?", options: JSON.stringify(["5", "6", "7", "8"]), correctAnswer: 1, category: "Sports", difficulty: "medium", points: 200 },
  { question: "What is the diameter of a basketball hoop in inches?", options: JSON.stringify(["16", "18", "20", "22"]), correctAnswer: 1, category: "Sports", difficulty: "hard", points: 300 },
  { question: "Which country won the FIFA World Cup in 2018?", options: JSON.stringify(["Germany", "Brazil", "France", "Argentina"]), correctAnswer: 2, category: "Sports", difficulty: "medium", points: 200 }
];

export function seedDatabase(): void {
  try {
    const db = getDatabase();

    logger.info('Seeding database with initial questions...');

    // Check if questions already exist
    const count = db.prepare('SELECT COUNT(*) as count FROM questions').get() as { count: number };

    if (count.count > 0) {
      logger.info('Questions already seeded, skipping...');
      return;
    }

    // Insert questions
    const insert = db.prepare(`
      INSERT INTO questions (question, options, correct_answer, category, difficulty, points)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((questions) => {
      for (const q of questions) {
        insert.run(q.question, q.options, q.correctAnswer, q.category, q.difficulty, q.points);
      }
    });

    insertMany(initialQuestions);

    logger.info(`Successfully seeded ${initialQuestions.length} questions`);
  } catch (error) {
    logger.error('Failed to seed database', { error });
    throw error;
  }
}

// Run seed if executed directly
if (require.main === module) {
  const db = require('./index');
  db.init();
  seedDatabase();
  db.close();
}
