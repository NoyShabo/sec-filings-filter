# Project Brief: SEC Filings Filter Application

## Project Overview
A full-stack web application that allows users to search, filter, and export SEC filings from sec.gov with advanced filtering capabilities including date ranges, filing types, and market capitalization filters.

## Core Requirements

### 1. SEC Filings Filtering
- Filter filings by date range (start date to end date)
- Quick filter shortcuts: Last 7, 30, 60, and 90 days
- Filter by file type (10-K, 8-K, 13F, 10-Q, etc.)
- Fetch ALL available pages from SEC API until no results remain

### 2. Market Cap Filtering
- Integration with Financial Modeling Prep API
- Set minimum and maximum market cap range
- Filter companies based on market cap before combining with SEC results

### 3. User Interface
- Clean, modern UI with Tailwind CSS
- Infinite scroll for browsing results
- Display company name, ticker, filing type, date, market cap, filing URL
- Export to CSV functionality for ALL results

### 4. Technical Requirements
- Frontend: Vite + React 18 + Tailwind CSS
- Backend: Node.js + Express
- Handle SEC API rate limits (10 requests/second)
- Fetch all pages when exporting to CSV
- Responsive design

## Success Criteria
- Users can search SEC filings with multiple filter combinations
- All matching results are fetched from SEC API (not limited to single page)
- Users can export complete filtered results to CSV
- Application respects API rate limits
- Smooth user experience with infinite scroll
- Clear display of filing information and market cap data

## Constraints
- Must respect SEC API rate limits (10 req/sec)
- Requires Financial Modeling Prep API key
- Market cap filtering depends on ticker symbol availability
- Large date ranges may take time to fetch completely

