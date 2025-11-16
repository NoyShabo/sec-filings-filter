import axios from 'axios'

const OTC_API_URL = 'https://www.otcmarkets.com/data/symbols';

// Cache for OTC stock list
let otcStockListCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch and cache the complete OTC stock list
 * @returns {Promise<Array>} Array of OTC stock objects
 */
export async function getOTCStockList() {
  // Return cached list if still valid
  if (otcStockListCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    console.log('Using cached OTC stock list');
    return otcStockListCache;
  }

  try {
    console.log('Fetching OTC stock list...');
    const response = await axios.get(OTC_API_URL, {
      timeout: 30000,
      headers: {
        'authority': 'backend.otcmarkets.com',
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en,en-US;q=0.9',
        'cache-control': 'no-cache',
        'origin': 'https://www.otcmarkets.com',
        'pragma': 'no-cache',
        'referer': 'https://www.otcmarkets.com/',
        'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      }
    });

    if (response.data && Array.isArray(response.data)) {
      // Transform to our format: { symbol: ticker, companyName: name }
      otcStockListCache = response.data
        .filter(item => item && item.s && item.c) // Only valid entries
        .map(item => ({
          symbol: item.s,
          companyName: item.c
        }));
      
      cacheTimestamp = Date.now();
      console.log(`✓ Cached ${otcStockListCache.length} OTC stocks`);
      return otcStockListCache;
    }

    return [];
  } catch (error) {
    console.error('Error fetching OTC stock list:', error.message);
    // Return cached list even if expired, better than nothing
    return otcStockListCache || [];
  }
}

/**
 * Find ticker by company name in OTC Markets data
 * @param {string} companyName - Company name
 * @returns {Promise<string|null>} Ticker symbol
 */
export async function findOTCTickerByName(companyName) {
  const otcList = await getOTCStockList();
  if (!otcList || otcList.length === 0) return null;

  // Clean company name - remove SEC prefixes and suffixes
  const cleanName = companyName
    .replace(/^[A-Z](\/[A-Z])?\s*-\s*/i, '')  // Remove "K -", "Q -", etc.
    .replace(/\s+(Inc\.?|Corp\.?|Ltd\.?|LLC|LP|Co\.?|Company|Corporation|Incorporated)$/i, '')
    .replace(/[,\.]/g, '')
    .toLowerCase()
    .trim();

  if (cleanName.length < 3) return null;

  // Method 1: Try exact match (case-insensitive)
  let match = otcList.find(stock => {
    const otcName = stock.companyName
      .replace(/\s+(Inc\.?|Corp\.?|Ltd\.?|LLC|LP|Co\.?|Company|Corporation|Incorporated)$/i, '')
      .replace(/[,\.]/g, '')
      .toLowerCase()
      .trim();
    return otcName === cleanName;
  });

  if (match) {
    console.log(`✓ Found OTC match (exact): "${companyName}" → ${match.symbol}`);
    return match.symbol;
  }

  // Method 2: Try partial match (contains)
  match = otcList.find(stock => {
    const otcName = stock.companyName
      .replace(/\s+(Inc\.?|Corp\.?|Ltd\.?|LLC|LP|Co\.?|Company|Corporation|Incorporated)$/i, '')
      .replace(/[,\.]/g, '')
      .toLowerCase()
      .trim();
    return otcName.includes(cleanName) || cleanName.includes(otcName);
  });

  if (match) {
    console.log(`✓ Found OTC match (partial): "${companyName}" → ${match.symbol}`);
    return match.symbol;
  }

  // Method 3: Try matching first significant words (at least 5 characters)
  const words = cleanName.split(/\s+/).filter(w => w.length >= 5);
  if (words.length > 0) {
    match = otcList.find(stock => {
      const otcName = stock.companyName.toLowerCase();
      // Require at least 2 matching words, or 1 word if it's the only word
      const matchCount = words.filter(word => otcName.includes(word)).length;
      return matchCount >= Math.min(2, words.length);
    });
  }

  if (match) {
    console.log(`✓ Found OTC match (keywords): "${companyName}" → ${match.symbol}`);
    return match.symbol;
  }

  return null;
}

/**
 * Fetch company profile from OTC Markets (includes market cap)
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<Object|null>} Company profile with market cap
 */
export async function fetchOTCCompanyProfile(ticker) {
  if (!ticker || ticker === 'N/A') return null;

  try {
    const url = `https://backend.otcmarkets.com/otcapi/company/profile/full/${ticker}?symbol=${ticker}`;
    console.log(`[OTC] Fetching profile for ${ticker}...`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'authority': 'backend.otcmarkets.com',
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en,en-US;q=0.9',
        'cache-control': 'no-cache',
        'origin': 'https://www.otcmarkets.com',
        'pragma': 'no-cache',
        'referer': 'https://www.otcmarkets.com/',
        'sec-ch-ua': '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
      }
    });

    if (response.data) {
      const data = response.data;
      
      // Extract market cap from the profile
      const marketCap = data.marketCap || data.profile?.marketCap || null;
      const securityDetails = data.securityDetails || data.profile?.securityDetails || {};
      
      return {
        ticker: data.symbol || ticker,
        companyName: data.name || data.securityName || null,
        marketCap: marketCap,
        industry: securityDetails.industrySector || 'N/A',
        sector: securityDetails.industrySector || 'N/A',
      };
    }

    return null;
  } catch (error) {
    // 404 means ticker not found on OTC Markets
    if (error.response?.status === 404) {
      console.log(`[OTC] Ticker ${ticker} not found on OTC Markets`);
    } else {
      console.error(`[OTC] Error fetching profile for ${ticker}:`, error.message);
    }
    return null;
  }
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache() {
  otcStockListCache = null;
  cacheTimestamp = null;
  console.log('OTC stock list cache cleared');
}

