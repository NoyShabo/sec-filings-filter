import express from 'express';
import { fetchSECFilings } from '../services/secAPI.js';
import { processFilings, paginateResults } from '../services/dataProcessor.js';

const router = express.Router();

/**
 * POST /api/filings
 * Get paginated SEC filings with market cap filtering
 */
router.post('/filings', async (req, res) => {
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

    // Fetch SEC filings (single page for now, will fetch all in export endpoint)
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
});

/**
 * POST /api/filings/export
 * Get ALL SEC filings for CSV export (no pagination)
 */
router.post('/filings/export', async (req, res) => {
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
    console.error('Error in /api/filings/export:', error);
    res.status(500).json({
      error: 'Failed to export filings',
      message: error.message,
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

