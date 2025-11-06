import config from '../config';
import logger from '../utils/logger';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  isRateLimited(clientId: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(clientId);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      this.limits.set(clientId, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    if (entry.count >= this.maxRequests) {
      logger.warn('Rate limit exceeded', {
        clientId,
        count: entry.count,
        maxRequests: this.maxRequests
      });
      return true;
    }

    entry.count++;
    return false;
  }

  getRetryAfter(clientId: string): number {
    const entry = this.limits.get(clientId);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }

  reset(clientId: string): void {
    this.limits.delete(clientId);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [clientId, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(clientId);
      }
    }
  }
}

// Create rate limiters for different actions
export const globalRateLimiter = new RateLimiter(
  config.rateLimit.windowMs,
  config.rateLimit.maxRequests
);

export const chatRateLimiter = new RateLimiter(
  config.rateLimit.chatLimitMs,
  1 // 1 message per window
);

export const answerRateLimiter = new RateLimiter(
  1000, // 1 second window
  5 // Max 5 answer submissions per second (prevents spam)
);
