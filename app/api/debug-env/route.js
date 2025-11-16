import { NextResponse } from 'next/server'

export async function GET() {
  const hasApiKey = !!process.env.FMP_API_KEY
  const apiKeyLength = process.env.FMP_API_KEY?.length || 0
  const apiKeyPreview = process.env.FMP_API_KEY ? 
    `${process.env.FMP_API_KEY.substring(0, 5)}...` : 
    'undefined'
  
  return NextResponse.json({
    hasApiKey,
    apiKeyLength,
    apiKeyPreview,
    allEnvKeys: Object.keys(process.env).filter(k => !k.startsWith('VERCEL_')).sort()
  })
}

