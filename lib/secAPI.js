import axios from 'axios'
import { secRateLimiter } from './rateLimiter.js'

const SEC_BASE_URL = 'https://www.sec.gov/cgi-bin/browse-edgar';
const RESULTS_PER_PAGE = 100; // SEC API max

// SEC requires a User-Agent header
const headers = {
  'User-Agent': 'SEC Filings Filter App contact@example.com',
  'Accept-Encoding': 'gzip, deflate',
  'Host': 'www.sec.gov'
};

/**
 * Fetch all SEC filings with pagination
 * @param {Object} params - Search parameters
 * @param {string} params.fileType - Filing type (e.g., '10-K', '8-K')
 * @param {string} params.startDate - Start date in YYYYMMDD format
 * @param {string} params.endDate - End date in YYYYMMDD format
 * @param {boolean} params.fetchAll - If true, fetch all pages; otherwise fetch single page
 * @param {number} params.page - Page number for paginated requests
 * @returns {Promise<Array>} Array of filing objects
 */
export async function fetchSECFilings({ fileType, startDate, endDate, fetchAll = false, page = 1 }) {
  const allFilings = [];
  let currentStart = (page - 1) * RESULTS_PER_PAGE;
  let hasMoreResults = true;
  let pageCount = 0;
  const MAX_PAGES = 50; // Safety limit to prevent infinite loops
  const seenFilings = new Set(); // Track unique filings to detect duplicates
  let consecutiveEmptyOrDuplicatePages = 0; // Track empty/duplicate pages

  console.log(`\n=== SEC API Fetch ===`);
  console.log(`Filing type: ${fileType}`);
  console.log(`Date range: ${startDate} to ${endDate}`);
  console.log(`Fetch all: ${fetchAll}, Starting page: ${page}`);

  while (hasMoreResults && pageCount < MAX_PAGES) {
    try {
      const filings = await secRateLimiter.add(async () => {
        const params = {
          action: 'getcurrent',
          type: fileType,
          owner: 'exclude',
          output: 'atom',
          count: RESULTS_PER_PAGE,
          start: currentStart,
        };

        console.log(`Fetching page ${pageCount + 1}, start: ${currentStart}`);
        
        const response = await axios.get(SEC_BASE_URL, { 
          params,
          headers,
          timeout: 30000 
        });

        const allFilingsFromPage = parseAtomResponse(response.data);
        
        // Store the raw count before filtering
        const rawCount = allFilingsFromPage.length;
        
        // Find the oldest filing date in this page
        let oldestDateInPage = null;
        allFilingsFromPage.forEach(filing => {
          if (filing.filingDate) {
            const dateNum = parseInt(filing.filingDate.replace(/-/g, ''));
            if (!oldestDateInPage || dateNum < oldestDateInPage) {
              oldestDateInPage = dateNum;
            }
          }
        });
        
        // Filter by date range (since getcurrent doesn't support date params)
        const filteredFilings = allFilingsFromPage.filter(filing => {
          if (!filing.filingDate) return false;
          const filingDateNum = parseInt(filing.filingDate.replace(/-/g, ''));
          const startDateNum = parseInt(startDate);
          const endDateNum = parseInt(endDate);
          return filingDateNum >= startDateNum && filingDateNum <= endDateNum;
        });
        
        return { filings: filteredFilings, rawCount, oldestDateInPage };
      });

      // Check for duplicate filings (indicates we're at the end of available data)
      let newFilingsCount = 0;
      for (const filing of filings.filings) {
        const filingId = `${filing.cik}-${filing.formType}-${filing.filingDate}`;
        if (!seenFilings.has(filingId)) {
          seenFilings.add(filingId);
          allFilings.push(filing);
          newFilingsCount++;
        }
      }

      pageCount++;

      const startDateNum = parseInt(startDate);
      console.log(`Fetched ${newFilingsCount} new filings (${filings.filings.length} total, ${filings.rawCount} raw from page, cumulative: ${allFilings.length})`);
      console.log(`Oldest date in this page: ${filings.oldestDateInPage}, Target start date: ${startDateNum}`);

      // Track empty or duplicate pages
      if (newFilingsCount === 0) {
        consecutiveEmptyOrDuplicatePages++;
        console.log(`⚠️ No new filings on this page (${consecutiveEmptyOrDuplicatePages}/3 empty or duplicate pages)`);
      } else {
        consecutiveEmptyOrDuplicatePages = 0;
      }

      // Check if we should continue
      if (!fetchAll) {
        // For paginated requests, return just this page
        hasMoreResults = false;
      } else if (consecutiveEmptyOrDuplicatePages >= 3) {
        // Stop after 3 consecutive empty or duplicate pages
        hasMoreResults = false;
        console.log('✓ Stopped: 3 consecutive pages with no new filings (reached end of data)');
      } else if (filings.rawCount < RESULTS_PER_PAGE) {
        // No more results available from SEC API
        hasMoreResults = false;
        console.log('✓ No more pages available from SEC API (incomplete page)');
      } else if (filings.oldestDateInPage && filings.oldestDateInPage < startDateNum) {
        // We've gone past the start date - no need to fetch more
        hasMoreResults = false;
        console.log('✓ Reached beyond start date - stopping pagination');
      } else {
        // Continue to next page
        currentStart += RESULTS_PER_PAGE;
      }
    } catch (error) {
      console.error(`Error fetching SEC filings at start ${currentStart}:`, error.message);
      
      // If it's a rate limit error, throw it; otherwise, break the loop
      if (error.response?.status === 429) {
        throw new Error('SEC API rate limit exceeded');
      }
      
      hasMoreResults = false;
    }
  }

  if (pageCount >= MAX_PAGES) {
    console.warn(`⚠️ Reached maximum page limit (${MAX_PAGES} pages). There may be more results.`);
  }

  console.log(`✓ SEC API complete: ${allFilings.length} total filings from ${pageCount} pages`);
  return allFilings;
}

/**
 * Parse SEC ATOM response
 * @param {string} data - XML/ATOM response data
 * @returns {Array} Array of parsed filing objects
 */
function parseAtomResponse(data) {
  const filings = [];
  
  // Simple regex-based parsing for ATOM/XML response
  // Extract entry elements
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  const entries = data.match(entryRegex) || [];

  for (const entry of entries) {
    try {
      // Try getcompany format first
      let company = extractTag(entry, 'company-name');
      let cik = extractTag(entry, 'cik');
      let formType = extractTag(entry, 'filing-type');
      let filingDate = extractTag(entry, 'filing-date');
      let fileNumber = extractTag(entry, 'file-number');
      let filingUrl = extractTag(entry, 'filing-href');
      let title = extractTag(entry, 'title');

      // If getcompany format failed, try getcurrent format
      if (!company || !cik) {
        // Extract from title: "10-K - ATMOS ENERGY CORP (0000731802) (Filer)"
        const titleMatch = title.match(/^([^\-]+)\s*-\s*(.+?)\s*\((\d+)\)/);
        if (titleMatch) {
          formType = titleMatch[1].trim();
          company = titleMatch[2].trim();
          cik = titleMatch[3].trim();
        }
      }

      // Extract filing date from summary if not in filing-date tag
      if (!filingDate) {
        const summary = extractTag(entry, 'summary');
        const dateMatch = summary.match(/Filed:&lt;\/b&gt;\s*(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          filingDate = dateMatch[1];
        }
      }

      // Extract URL from link if not in filing-href
      if (!filingUrl) {
        const linkMatch = entry.match(/<link[^>]+rel="alternate"[^>]+href="([^"]+)"/);
        if (linkMatch) {
          filingUrl = linkMatch[1];
        }
      }

      // Extract form type from category if not found
      if (!formType) {
        const categoryMatch = entry.match(/<category[^>]+term="([^"]+)"/);
        if (categoryMatch) {
          formType = categoryMatch[1];
        }
      }

      const filing = {
        company,
        cik,
        formType,
        filingDate,
        fileNumber,
        filingUrl,
        title,
      };

      // Only add if we have essential data
      if (filing.company && filing.cik && filing.formType) {
        filings.push(filing);
      }
    } catch (error) {
      console.error('Error parsing entry:', error.message);
    }
  }

  return filings;
}

/**
 * Extract content from XML tag
 * @param {string} xml - XML string
 * @param {string} tagName - Tag name to extract
 * @returns {string} Tag content
 */
function extractTag(xml, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

/**
 * Fetch company details by CIK
 * @param {string} cik - Company CIK number
 * @returns {Promise<Object>} Company details
 */
export async function fetchCompanyByCIK(cik) {
  try {
    return await secRateLimiter.add(async () => {
      const params = {
        action: 'getcompany',
        CIK: cik,
        output: 'atom',
        count: 1,
      };

      const response = await axios.get(SEC_BASE_URL, { 
        params,
        headers,
        timeout: 30000 
      });

      const entries = parseAtomResponse(response.data);
      return entries[0] || null;
    });
  } catch (error) {
    console.error(`Error fetching company by CIK ${cik}:`, error.message);
    return null;
  }
}

