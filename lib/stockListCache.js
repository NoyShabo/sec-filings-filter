import axios from 'axios'

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';
const FMP_API_KEY = process.env.FMP_API_KEY;

// Cache for stock list
let stockListCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch and cache the complete stock list from FMP
 * @returns {Promise<Array>} Array of stock objects
 */
export async function getStockList() {
  // Return cached list if still valid
  if (stockListCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    console.log('Using cached stock list');
    return stockListCache;
  }

  try {
    console.log('Fetching stock list from FMP...');
    const response = await axios.get(`${FMP_BASE_URL}/stock/list`, {
      params: { apikey: FMP_API_KEY },
      timeout: 30000,
    });

    if (response.data && Array.isArray(response.data)) {
      stockListCache = response.data;
      cacheTimestamp = Date.now();
      console.log(`Cached ${stockListCache.length} stocks`);
      return stockListCache;
    }

    return [];
  } catch (error) {
    console.error('Error fetching stock list:', error.message);
    // Return cached list even if expired, better than nothing
    return stockListCache || [];
  }
}

/**
 * Find ticker by CIK in cached stock list
 * NOTE: Stock list API doesn't include CIK data, so this won't work
 * Keeping for future compatibility
 * @param {string} cik - Company CIK
 * @returns {Promise<string|null>} Ticker symbol
 */
export async function findTickerByCIK(cik) {
  // Stock list doesn't include CIK data
  return null;
}

/**
 * Find ticker by company name in cached stock list
 * @param {string} companyName - Company name
 * @returns {Promise<string|null>} Ticker symbol
 */
export async function findTickerByName(companyName) {
  const stockList = await getStockList();
  if (!stockList || stockList.length === 0) return null;

  // Clean company name - remove SEC prefixes and suffixes
  const cleanName = companyName
    .replace(/^[A-Z](\/[A-Z])?\s*-\s*/i, '')  // Remove "K -", "Q -", etc.
    .replace(/\s+(Inc\.?|Corp\.?|Ltd\.?|LLC|LP|Co\.?|Company|Corporation|Incorporated)$/i, '')
    .replace(/[,\.]/g, '')
    .toLowerCase()
    .trim();

  if (cleanName.length < 3) return null;

  // Filter to US exchanges only (NASDAQ, NYSE, AMEX) for better accuracy
  const usStocks = stockList.filter(stock => 
    stock.exchangeShortName === 'NASDAQ' || 
    stock.exchangeShortName === 'NYSE' || 
    stock.exchangeShortName === 'AMEX' ||
    stock.exchangeShortName === 'NYSE MKT'
  );

  // Method 1: Try exact match
  let match = usStocks.find(stock => {
    if (!stock.name) return false;
    const stockName = stock.name
      .replace(/\s+(Inc\.?|Corp\.?|Ltd\.?|LLC|LP|Co\.?|Company|Corporation|Incorporated)$/i, '')
      .replace(/[,\.]/g, '')
      .toLowerCase()
      .trim();
    return stockName === cleanName;
  });

  if (match) return match.symbol;

  // Method 2: Try partial match (cleanName contains stockName or vice versa)
  match = usStocks.find(stock => {
    if (!stock.name) return false;
    const stockName = stock.name
      .replace(/\s+(Inc\.?|Corp\.?|Ltd\.?|LLC|LP|Co\.?|Company|Corporation|Incorporated)$/i, '')
      .replace(/[,\.]/g, '')
      .toLowerCase()
      .trim();
    return stockName.includes(cleanName) || cleanName.includes(stockName);
  });

  if (match) return match.symbol;

  // Method 3: Try matching first significant words (at least 5 characters)
  const words = cleanName.split(/\s+/).filter(w => w.length >= 5);
  if (words.length > 0) {
    match = usStocks.find(stock => {
      if (!stock.name) return false;
      const stockName = stock.name.toLowerCase();
      return words.some(word => stockName.includes(word));
    });
  }

  return match ? match.symbol : null;
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache() {
  stockListCache = null;
  cacheTimestamp = null;
  console.log('Stock list cache cleared');
}

