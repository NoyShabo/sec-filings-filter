import axios from 'axios';
import dotenv from 'dotenv';
import { findTickerByCIK, findTickerByName } from './stockListCache.js';

dotenv.config();

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';
const FMP_API_KEY = process.env.FMP_API_KEY;

/**
 * Fetch market cap for a specific company by ticker
 * @param {string} ticker - Company ticker symbol
 * @returns {Promise<Object|null>} Company data with market cap
 */
export async function fetchMarketCapByTicker(ticker) {
  if (!FMP_API_KEY) {
    throw new Error('FMP_API_KEY is not configured in environment variables');
  }

  try {
    const response = await axios.get(`${FMP_BASE_URL}/market-capitalization/${ticker}`, {
      params: { apikey: FMP_API_KEY },
      timeout: 10000,
    });

    if (response.data && response.data.length > 0) {
      const data = response.data[0];
      return {
        ticker: data.symbol,
        marketCap: data.marketCap,
        date: data.date,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching market cap for ${ticker}:`, error.message);
    return null;
  }
}

/**
 * Fetch market cap for multiple companies by tickers (batch)
 * @param {Array<string>} tickers - Array of ticker symbols
 * @returns {Promise<Object>} Map of ticker to market cap data
 */
export async function fetchMarketCapBatch(tickers) {
  if (!FMP_API_KEY) {
    throw new Error('FMP_API_KEY is not configured in environment variables');
  }

  const results = {};
  
  // Process in batches to avoid overwhelming the API
  const batchSize = 10;
  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);
    
    const promises = batch.map(async (ticker) => {
      const data = await fetchMarketCapByTicker(ticker);
      if (data) {
        results[ticker] = data;
      }
    });

    await Promise.all(promises);
    
    // Small delay between batches
    if (i + batchSize < tickers.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Search for company by name to get ticker
 * @param {string} companyName - Company name
 * @returns {Promise<string|null>} Ticker symbol
 */
export async function searchCompanyTicker(companyName) {
  if (!FMP_API_KEY) {
    throw new Error('FMP_API_KEY is not configured in environment variables');
  }

  try {
    const response = await axios.get(`${FMP_BASE_URL}/search`, {
      params: { 
        query: companyName,
        limit: 5,
        apikey: FMP_API_KEY 
      },
      timeout: 10000,
    });

    if (response.data && response.data.length > 0) {
      // Return the first match
      return response.data[0].symbol;
    }

    return null;
  } catch (error) {
    console.error(`Error searching for company ${companyName}:`, error.message);
    return null;
  }
}

/**
 * Get company profile with market cap
 * @param {string} ticker - Company ticker symbol
 * @returns {Promise<Object|null>} Company profile data
 */
export async function fetchCompanyProfile(ticker) {
  if (!FMP_API_KEY) {
    throw new Error('FMP_API_KEY is not configured in environment variables');
  }

  try {
    const response = await axios.get(`${FMP_BASE_URL}/profile/${ticker}`, {
      params: { apikey: FMP_API_KEY },
      timeout: 10000,
    });

    if (response.data && response.data.length > 0) {
      const profile = response.data[0];
      return {
        ticker: profile.symbol,
        companyName: profile.companyName,
        marketCap: profile.mktCap,
        industry: profile.industry,
        sector: profile.sector,
        cik: profile.cik,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching profile for ${ticker}:`, error.message);
    return null;
  }
}

/**
 * Convert CIK to ticker using multiple methods
 * @param {string} cik - Company CIK number
 * @param {string} companyName - Company name (optional fallback)
 * @returns {Promise<string|null>} Ticker symbol
 */
export async function cikToTicker(cik, companyName = null) {
  if (!FMP_API_KEY) {
    throw new Error('FMP_API_KEY is not configured in environment variables');
  }

  try {
    // Method 1: Search in cached stock list by CIK (fastest, no API calls)
    const cachedTickerByCIK = await findTickerByCIK(cik);
    if (cachedTickerByCIK) {
      console.log(`✓ Found in cache by CIK: ${cik} → ${cachedTickerByCIK}`);
      return cachedTickerByCIK;
    }

    // Method 2: Search in cached stock list by company name
    if (companyName) {
      const cachedTickerByName = await findTickerByName(companyName);
      if (cachedTickerByName) {
        console.log(`✓ Found in cache by name: "${companyName}" → ${cachedTickerByName}`);
        return cachedTickerByName;
      }
    }

    // Method 3: Try FMP CIK search API (pad CIK with leading zeros to 10 digits)
    const paddedCik = cik.padStart(10, '0');
    
    const cikResponse = await axios.get(`${FMP_BASE_URL}/cik-search/${paddedCik}`, {
      params: { apikey: FMP_API_KEY },
      timeout: 10000,
    });

    if (cikResponse.data && cikResponse.data.length > 0) {
      console.log(`✓ Found via CIK API: ${cik} → ${cikResponse.data[0].symbol}`);
      return cikResponse.data[0].symbol;
    }

    // Method 4: Fallback to FMP search API by company name
    if (companyName) {
      // Clean up company name (remove prefixes like "K -", "Q -", "K/A -", etc. and common suffixes)
      let cleanName = companyName
        .replace(/^[A-Z](\/[A-Z])?\s*-\s*/i, '')  // Remove "K -", "Q -", "K/A -" etc. at start
        .replace(/\s+(Inc\.|Corp\.|Ltd\.|LLC|LP|Co\.|Company|Corporation|Incorporated)$/i, '')  // Remove suffixes
        .replace(/[,\.]/g, '')  // Remove commas and periods
        .trim();

      if (cleanName.length >= 3) {
        console.log(`Searching FMP API for: "${cleanName}" (original: "${companyName}")`);
        
        const nameResponse = await axios.get(`${FMP_BASE_URL}/search`, {
          params: { 
            query: cleanName,
            limit: 1,
            apikey: FMP_API_KEY 
          },
          timeout: 10000,
        });

        if (nameResponse.data && nameResponse.data.length > 0) {
          console.log(`✓ Found via name API: "${cleanName}" → ${nameResponse.data[0].symbol}`);
          return nameResponse.data[0].symbol;
        } else {
          console.log(`✗ No results for "${cleanName}"`);
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Error converting CIK ${cik} to ticker:`, error.message);
    return null;
  }
}

