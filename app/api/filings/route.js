import { NextResponse } from 'next/server'
import { fetchFilingsHybrid } from '../../../lib/hybridFilingsAPI.js'
import { processFilings, paginateResults } from '../../../lib/dataProcessor.js'

// Handle CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      startDate,
      endDate,
      fileType,
      minMarketCap,
      maxMarketCap,
      page = 1,
      limit = 50,
    } = body

    // Validate required fields
    if (!startDate || !endDate || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields: startDate, endDate, and fileType are required' },
        { status: 400 }
      )
    }

    // Convert dates from YYYY-MM-DD to YYYYMMDD format for SEC API
    const formattedStartDate = startDate.replace(/-/g, '')
    const formattedEndDate = endDate.replace(/-/g, '')

    console.log('Fetching filings with params:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      fileType,
      minMarketCap,
      maxMarketCap,
      page,
      limit,
    })

    // Fetch SEC filings using hybrid approach (FMP for historical, SEC for recent)
    const secFilings = await fetchFilingsHybrid({
      fileType,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      fetchAll: false,
      page,
    })

    if (secFilings.length === 0) {
      return NextResponse.json({
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalResults: 0,
          resultsPerPage: limit,
          hasMore: false,
        },
      })
    }

    // Process filings with market cap filtering
    const processedFilings = await processFilings(secFilings, {
      minMarketCap,
      maxMarketCap,
    })

    // Return paginated results
    const result = paginateResults(processedFilings, page, limit)
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in /api/filings:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch filings',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

