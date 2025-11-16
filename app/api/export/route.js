import { NextResponse } from 'next/server'
import { fetchFilingsHybrid } from '../../../lib/hybridFilingsAPI.js'
import { processFilings } from '../../../lib/dataProcessor.js'

// Configure runtime to use Node.js
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    console.log('Exporting all filings with params:', {
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      fileType,
      minMarketCap,
      maxMarketCap,
    })

    // Fetch ALL SEC filings using hybrid approach (FMP for historical, SEC for recent)
    const secFilings = await fetchFilingsHybrid({
      fileType,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      fetchAll: true,
    })

    if (secFilings.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
      })
    }

    // Process filings with market cap filtering
    const processedFilings = await processFilings(secFilings, {
      minMarketCap,
      maxMarketCap,
    })

    console.log(`Returning ${processedFilings.length} filings for export`)

    // Return all results (no pagination)
    return NextResponse.json({
      data: processedFilings,
      total: processedFilings.length,
    })
  } catch (error) {
    console.error('Error in /api/export:', error)
    return NextResponse.json(
      {
        error: 'Failed to export filings',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

