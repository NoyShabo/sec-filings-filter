import { fetchSECFilings } from '../server/src/services/secAPI.js';
import { processFilings, paginateResults } from '../server/src/services/dataProcessor.js';

// Enable CORS
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  return await fn(req, res);
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      startDate,
      endDate,
      fileType,
      minMarketCap,
      maxMarketCap,
      page = 1,
      limit = 50,
    } = req.body;

    // Validate required fields
    if (!startDate || !endDate || !fileType) {
      return res.status(400).json({
        error: 'Missing required fields: startDate, endDate, and fileType are required',
      });
    }

    // Convert dates from YYYY-MM-DD to YYYYMMDD format for SEC API
    const formattedStartDate = startDate.replace(/-/g, '');
    const formattedEndDate = endDate.replace(/-/g, '');

    console.log('Fetching filings with params:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      fileType,
      minMarketCap,
      maxMarketCap,
      page,
      limit,
    });

    // Fetch SEC filings (single page)
    const secFilings = await fetchSECFilings({
      fileType,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      fetchAll: false,
      page,
    });

    if (secFilings.length === 0) {
      return res.json({
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalResults: 0,
          resultsPerPage: limit,
          hasMore: false,
        },
      });
    }

    // Process filings with market cap filtering
    const processedFilings = await processFilings(secFilings, {
      minMarketCap,
      maxMarketCap,
    });

    // Return paginated results
    const result = paginateResults(processedFilings, page, limit);
    
    res.json(result);
  } catch (error) {
    console.error('Error in /api/filings:', error);
    res.status(500).json({
      error: 'Failed to fetch filings',
      message: error.message,
    });
  }
}

export default allowCors(handler);

