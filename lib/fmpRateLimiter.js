import PQueue from 'p-queue';

/**
 * Rate limiter for FMP API
 * Limit: 200 requests per minute = 3.33 requests per second
 * Using 2.5 requests per second (400ms interval) to be extra safe
 */
const fmpQueue = new PQueue({
  concurrency: 1, // Process one request at a time
  interval: 400,  // 400ms between requests = 2.5 requests/second
  intervalCap: 1, // 1 request per interval
});

/**
 * Add a rate-limited FMP API request to the queue
 * @param {Function} requestFn - Function that returns a Promise (axios request)
 * @returns {Promise} The result of the request
 */
export async function rateLimitedFMPRequest(requestFn) {
  return fmpQueue.add(requestFn);
}

/**
 * Get current queue statistics
 * @returns {Object} Queue statistics
 */
export function getFMPQueueStats() {
  return {
    size: fmpQueue.size,
    pending: fmpQueue.pending,
  };
}

export default fmpQueue;

