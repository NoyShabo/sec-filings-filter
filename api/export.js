import { fetchSECFilings } from '../server/src/services/secAPI.js';
import { processFilings } from '../server/src/services/dataProcessor.js';

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

    console.log('Exporting all filings with params:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      fileType,
      minMarketCap,
      maxMarketCap,
    });

    // Fetch ALL SEC filings (fetchAll = true)
    const secFilings = await fetchSECFilings({
      fileType,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      fetchAll: true, // Important: fetch all pages
    });

    if (secFilings.length === 0) {
      return res.json({
        data: [],
        total: 0,
      });
    }

    // Process filings with market cap filtering
    const processedFilings = await processFilings(secFilings, {
      minMarketCap,
      maxMarketCap,
    });

    console.log(`Returning ${processedFilings.length} filings for export`);

    // Return all results (no pagination)
    res.json({
      data: processedFilings,
      total: processedFilings.length,
    });
  } catch (error) {
    console.error('Error in /api/export:', error);
    res.status(500).json({
      error: 'Failed to export filings',
      message: error.message,
    });
  }
}

export default allowCors(handler);

