import { getDatabase } from '../database';
import { Question } from '../types';
import logger from '../utils/logger';

export class QuestionService {
  private db = getDatabase();

  /**
   * Get questions from database with optional filtering
   */
  getQuestions(
    count: number = 10,
    difficulty: string | null = null,
    category: string | null = null
  ): Question[] {
    try {
      let query = 'SELECT * FROM questions WHERE 1=1';
      const params: any[] = [];

      if (difficulty) {
        query += ' AND difficulty = ?';
        params.push(difficulty);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY RANDOM() LIMIT ?';
      params.push(count);

      const rows = this.db.prepare(query).all(...params) as any[];

      return rows.map(row => ({
        id: row.id,
        question: row.question,
        options: JSON.parse(row.options),
        correctAnswer: row.correct_answer,
        category: row.category,
        difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
        points: row.points
      }));
    } catch (error) {
      logger.error('Failed to get questions', { error, difficulty, category, count });
      throw error;
    }
  }

  /**
   * Get a specific question by ID
   */
  getQuestionById(id: number): Question | null {
    try {
      const row = this.db.prepare('SELECT * FROM questions WHERE id = ?').get(id) as any;

      if (!row) return null;

      return {
        id: row.id,
        question: row.question,
        options: JSON.parse(row.options),
        correctAnswer: row.correct_answer,
        category: row.category,
        difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
        points: row.points
      };
    } catch (error) {
      logger.error('Failed to get question by ID', { error, id });
      return null;
    }
  }

  /**
   * Get all unique categories
   */
  getCategories(): string[] {
    try {
      const rows = this.db.prepare('SELECT DISTINCT category FROM questions ORDER BY category').all() as any[];
      return rows.map(row => row.category);
    } catch (error) {
      logger.error('Failed to get categories', { error });
      return [];
    }
  }

  /**
   * Get all unique difficulty levels
   */
  getDifficulties(): string[] {
    try {
      const rows = this.db.prepare('SELECT DISTINCT difficulty FROM questions ORDER BY difficulty').all() as any[];
      return rows.map(row => row.difficulty);
    } catch (error) {
      logger.error('Failed to get difficulties', { error });
      return [];
    }
  }

  /**
   * Calculate points based on answer time (speed bonus)
   */
  calculatePoints(basePoints: number, answerTime: number, questionDuration: number): number {
    // Faster answers get up to 50% bonus
    const timeBonus = Math.max(0, 1 - (answerTime / questionDuration)) * 0.5;
    return Math.round(basePoints * (1 + timeBonus));
  }

  /**
   * Add a new question (for future admin functionality)
   */
  addQuestion(question: Omit<Question, 'id'>): number {
    try {
      const result = this.db.prepare(`
        INSERT INTO questions (question, options, correct_answer, category, difficulty, points)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        question.question,
        JSON.stringify(question.options),
        question.correctAnswer,
        question.category,
        question.difficulty,
        question.points
      );

      logger.info('Question added', { id: result.lastInsertRowid });
      return result.lastInsertRowid as number;
    } catch (error) {
      logger.error('Failed to add question', { error, question });
      throw error;
    }
  }

  /**
   * Update an existing question
   */
  updateQuestion(id: number, question: Partial<Omit<Question, 'id'>>): boolean {
    try {
      const updates: string[] = [];
      const params: any[] = [];

      if (question.question) {
        updates.push('question = ?');
        params.push(question.question);
      }
      if (question.options) {
        updates.push('options = ?');
        params.push(JSON.stringify(question.options));
      }
      if (question.correctAnswer !== undefined) {
        updates.push('correct_answer = ?');
        params.push(question.correctAnswer);
      }
      if (question.category) {
        updates.push('category = ?');
        params.push(question.category);
      }
      if (question.difficulty) {
        updates.push('difficulty = ?');
        params.push(question.difficulty);
      }
      if (question.points) {
        updates.push('points = ?');
        params.push(question.points);
      }

      if (updates.length === 0) return false;

      updates.push('updated_at = datetime("now")');
      params.push(id);

      const result = this.db.prepare(`
        UPDATE questions SET ${updates.join(', ')} WHERE id = ?
      `).run(...params);

      logger.info('Question updated', { id, changes: result.changes });
      return result.changes > 0;
    } catch (error) {
      logger.error('Failed to update question', { error, id, question });
      throw error;
    }
  }

  /**
   * Delete a question
   */
  deleteQuestion(id: number): boolean {
    try {
      const result = this.db.prepare('DELETE FROM questions WHERE id = ?').run(id);
      logger.info('Question deleted', { id, changes: result.changes });
      return result.changes > 0;
    } catch (error) {
      logger.error('Failed to delete question', { error, id });
      throw error;
    }
  }

  /**
   * Get question count by category and difficulty
   */
  getQuestionStats(): Record<string, any> {
    try {
      const stats = this.db.prepare(`
        SELECT
          COUNT(*) as total,
          category,
          difficulty,
          COUNT(*) as count
        FROM questions
        GROUP BY category, difficulty
      `).all();

      return {
        total: this.db.prepare('SELECT COUNT(*) as count FROM questions').get() as any,
        byCategory: stats
      };
    } catch (error) {
      logger.error('Failed to get question stats', { error });
      return { total: 0, byCategory: [] };
    }
  }
}

export default new QuestionService();
