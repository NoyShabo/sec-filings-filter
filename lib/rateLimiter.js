import PQueue from 'p-queue';

// SEC allows 10 requests per second
// We'll be conservative and use 8 requests per second
const SEC_RATE_LIMIT = 8;
const INTERVAL = 1000; // 1 second

class RateLimiter {
  constructor() {
    this.queue = new PQueue({
      interval: INTERVAL,
      intervalCap: SEC_RATE_LIMIT,
    });
  }

  async add(fn) {
    return this.queue.add(fn);
  }

  getQueueSize() {
    return this.queue.size;
  }

  getPending() {
    return this.queue.pending;
  }
}

export const secRateLimiter = new RateLimiter();

