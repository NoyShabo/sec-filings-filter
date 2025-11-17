import { fetchMarketCapBatch, cikToTicker, fetchCompanyProfile } from './fmpAPI.js';
import { fetchOTCCompanyProfile } from './otcMarketsCache.js';

/**
 * Process and merge SEC filings with market cap data
 * @param {Array} filings - Array of SEC filing objects
 * @param {Object} filters - Filter criteria
 * @param {number} filters.minMarketCap - Minimum market cap
 * @param {number} filters.maxMarketCap - Maximum market cap
 * @returns {Promise<Array>} Filtered and enriched filings
 */
export async function processFilings(filings, filters) {
  console.log(`Processing ${filings.length} filings with market cap filters`);

  // Step 1: Extract unique CIKs and convert to tickers
  const uniqueCiks = [...new Set(filings.map(f => f.cik))];
  console.log(`Found ${uniqueCiks.length} unique companies`);

  // Step 2: Convert CIKs to tickers (with company name fallback)
  const cikToTickerMap = {};
  const cikToCompanyMap = {};
  
  // Build a map of CIK to company name
  filings.forEach(filing => {
    if (filing.cik && filing.company) {
      cikToCompanyMap[filing.cik] = filing.company;
    }
  });

  // Process CIKs in small batches to avoid overwhelming the rate limiter
  const BATCH_SIZE = 5; // Process 5 companies at a time
  console.log(`Processing ${uniqueCiks.length} CIKs in batches of ${BATCH_SIZE}...`);
  
  for (let i = 0; i < uniqueCiks.length; i += BATCH_SIZE) {
    const batch = uniqueCiks.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uniqueCiks.length / BATCH_SIZE)}...`);
    
    const batchPromises = batch.map(async (cik) => {
      try {
        const companyName = cikToCompanyMap[cik];
        const ticker = await cikToTicker(cik, companyName);
        if (ticker) {
          cikToTickerMap[cik] = ticker;
          console.log(`✓ CIK ${cik} (${companyName}) → Ticker ${ticker}`);
        } else {
          console.log(`✗ CIK ${cik} (${companyName}) → No ticker found`);
        }
      } catch (error) {
        console.error(`Error converting CIK ${cik} to ticker:`, error.message);
      }
    });
    
    await Promise.all(batchPromises);
  }
  
  console.log(`Resolved ${Object.keys(cikToTickerMap).length} CIK to ticker mappings out of ${uniqueCiks.length} total companies`);

  // Step 3: Fetch market cap data for all tickers
  const tickers = Object.values(cikToTickerMap);
  const marketCapData = {};

  if (tickers.length > 0) {
    console.log(`Fetching market cap for ${tickers.length} tickers in batches...`);
    
    // Process tickers in small batches to avoid overwhelming the rate limiter
    const PROFILE_BATCH_SIZE = 5; // Process 5 tickers at a time
    
    for (let i = 0; i < tickers.length; i += PROFILE_BATCH_SIZE) {
      const batch = tickers.slice(i, i + PROFILE_BATCH_SIZE);
      console.log(`Fetching market cap batch ${Math.floor(i / PROFILE_BATCH_SIZE) + 1}/${Math.ceil(tickers.length / PROFILE_BATCH_SIZE)}...`);
      
      const profilePromises = batch.map(async (ticker) => {
        try {
          // Try FMP first
          let profile = await fetchCompanyProfile(ticker);
          
          if (profile && profile.marketCap) {
            marketCapData[ticker] = profile;
            console.log(`✓ [FMP] ${ticker} → Market Cap: $${(profile.marketCap / 1e9).toFixed(2)}B`);
          } else {
            // Fallback to OTC Markets if FMP doesn't have data
            console.log(`[FMP] ${ticker} → No market cap, trying OTC Markets...`);
            profile = await fetchOTCCompanyProfile(ticker);
            
            if (profile && profile.marketCap) {
              marketCapData[ticker] = profile;
              console.log(`✓ [OTC] ${ticker} → Market Cap: $${(profile.marketCap / 1e9).toFixed(2)}B`);
            } else {
              console.log(`✗ ${ticker} → No market cap data from FMP or OTC`);
            }
          }
        } catch (error) {
          console.error(`Error fetching market cap for ${ticker}:`, error.message);
        }
      });
      
      await Promise.all(profilePromises);
    }
    
    console.log(`Fetched market cap data for ${Object.keys(marketCapData).length} out of ${tickers.length} companies`);
  } else {
    console.log('No tickers resolved, skipping market cap fetch');
  }

  // Step 4: Enrich filings with market cap and filter
  const enrichedFilings = [];

  for (const filing of filings) {
    const ticker = cikToTickerMap[filing.cik];
    const marketData = ticker ? marketCapData[ticker] : null;

    // Create enriched filing object
    const enrichedFiling = {
      company: filing.company,
      ticker: ticker || 'N/A',
      cik: filing.cik,
      formType: filing.formType,
      filingDate: filing.filingDate,
      marketCap: marketData?.marketCap || null,
      industry: marketData?.industry || 'N/A',
      sector: marketData?.sector || 'N/A',
      filingUrl: filing.filingUrl,
      fileNumber: filing.fileNumber,
    };

    // Apply market cap filter ONLY if company has market cap data
    if (enrichedFiling.marketCap && (filters.minMarketCap !== undefined || filters.maxMarketCap !== undefined)) {
      const marketCap = enrichedFiling.marketCap;

      // Skip only if the market cap doesn't meet the filter criteria
      if (filters.minMarketCap !== undefined && marketCap < filters.minMarketCap) {
        continue;
      }

      if (filters.maxMarketCap !== undefined && marketCap > filters.maxMarketCap) {
        continue;
      }
    }

    // Always include the filing (with or without market cap data)
    enrichedFilings.push(enrichedFiling);
  }

  console.log(`Filtered to ${enrichedFilings.length} filings matching criteria`);
  return enrichedFilings;
}

/**
 * Paginate results
 * @param {Array} data - Array of data to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Results per page
 * @returns {Object} Paginated results with metadata
 */
export function paginateResults(data, page = 1, limit = 50) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(data.length / limit),
      totalResults: data.length,
      resultsPerPage: limit,
      hasMore: endIndex < data.length,
    },
  };
}

/**
 * Format market cap for display
 * @param {number} marketCap - Market cap value
 * @returns {string} Formatted market cap
 */
export function formatMarketCap(marketCap) {
  if (!marketCap) return 'N/A';

  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `$${marketCap.toLocaleString()}`;
  }
}

