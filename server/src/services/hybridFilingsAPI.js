import { fetchSECFilings } from './secAPI.js';
import { fetchSECFilingsFromFMP, checkFMPRSSFeedAvailable } from './fmpAPI.js';

// Cache FMP availability check (so we don't check every request)
let fmpAvailable = null;
let fmpCheckTimestamp = null;
const FMP_CHECK_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Hybrid SEC filings fetcher - tries FMP first, falls back to SEC API
 * @param {Object} params - Search parameters
 * @param {string} params.fileType - Filing type
 * @param {string} params.startDate - Start date in YYYYMMDD format
 * @param {string} params.endDate - End date in YYYYMMDD format
 * @param {boolean} params.fetchAll - Fetch all pages or just one
 * @param {number} params.page - Page number
 * @returns {Promise<Array>} Array of filings
 */
export async function fetchFilingsHybrid({ fileType, startDate, endDate, fetchAll = false, page = 1 }) {
  // Convert YYYYMMDD to YYYY-MM-DD for FMP
  const startDateFormatted = `${startDate.substring(0, 4)}-${startDate.substring(4, 6)}-${startDate.substring(6, 8)}`;
  const endDateFormatted = `${endDate.substring(0, 4)}-${endDate.substring(4, 6)}-${endDate.substring(6, 8)}`;

  // Calculate days between dates
  const start = new Date(startDateFormatted);
  const end = new Date(endDateFormatted);
  const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));

  console.log(`\n=== Hybrid Filings Fetch ===`);
  console.log(`Date range: ${startDateFormatted} to ${endDateFormatted} (${daysDiff} days)`);
  console.log(`Filing type: ${fileType}`);

  // Strategy decision:
  // - If date range <= 30 days: Use SEC API (fast, free, reliable for recent data)
  // - If date range > 30 days: Try FMP first (supports historical), fallback to SEC
  
  if (daysDiff <= 30) {
    console.log(`✓ Using SEC API (date range <= 30 days)`);
    return await fetchSECFilings({ fileType, startDate, endDate, fetchAll, page });
  }

  // For historical data (> 30 days), check if FMP is available
  const now = Date.now();
  if (fmpAvailable === null || (now - fmpCheckTimestamp) > FMP_CHECK_CACHE_DURATION) {
    console.log(`Checking FMP RSS feed availability...`);
    fmpAvailable = await checkFMPRSSFeedAvailable();
    fmpCheckTimestamp = now;
    console.log(`FMP RSS feed available: ${fmpAvailable}`);
  }

  // Try FMP if available
  if (fmpAvailable) {
    try {
      console.log(`✓ Attempting FMP API (historical data support)`);
      
      if (fetchAll) {
        // Fetch all pages from FMP
        const allFilings = [];
        let currentPage = 0;
        let hasMore = true;

        while (hasMore) {
          const filings = await fetchSECFilingsFromFMP({
            fileType,
            startDate: startDateFormatted,
            endDate: endDateFormatted,
            page: currentPage,
            limit: 100,
          });

          allFilings.push(...filings);
          
          // FMP returns empty array when no more results
          if (filings.length < 100) {
            hasMore = false;
          } else {
            currentPage++;
          }
        }

        console.log(`✓ FMP returned ${allFilings.length} total filings`);
        return allFilings;
      } else {
        // Fetch single page from FMP
        const filings = await fetchSECFilingsFromFMP({
          fileType,
          startDate: startDateFormatted,
          endDate: endDateFormatted,
          page: page - 1, // FMP uses 0-indexed pages
          limit: 100,
        });
        
        console.log(`✓ FMP returned ${filings.length} filings`);
        return filings;
      }
    } catch (error) {
      if (error.message === 'FMP_PREMIUM_REQUIRED') {
        console.warn(`⚠️ FMP RSS feed requires premium subscription`);
        fmpAvailable = false; // Cache that it's not available
      } else {
        console.error(`❌ FMP API error: ${error.message}`);
      }
      
      console.log(`↻ Falling back to SEC API...`);
    }
  }

  // Fallback to SEC API
  console.log(`⚠️ Using SEC API fallback (limited to recent filings)`);
  console.log(`   Note: Results may be incomplete for dates older than 30 days`);
  
  return await fetchSECFilings({ fileType, startDate, endDate, fetchAll, page });
}

