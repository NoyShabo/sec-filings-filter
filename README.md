# SEC Filings Filter Application

A full-stack web application for filtering and fetching SEC filings from sec.gov with advanced market cap controls.

## Features

- **Date Range Filtering**: Filter filings by custom date range or use quick shortcuts (7, 30, 60, 90 days)
- **Filing Type Selection**: Search for specific filing types (10-K, 8-K, 13F, etc.)
- **Market Cap Filtering**: Filter companies by market capitalization range
- **Infinite Scroll**: Smooth browsing experience with automatic loading of more results
- **CSV Export**: Export all filtered results to CSV with one click
- **Full Data Fetching**: Automatically fetches ALL pages from SEC API when exporting

## Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **date-fns** - Date manipulation library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Axios** - HTTP client for external APIs
- **p-queue** - Rate limiting for SEC API requests
- **dotenv** - Environment configuration

## Project Structure

```
filter-1/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── FilingsList.jsx
│   │   │   └── ExportButton.jsx
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── useSECFilings.js
│   │   │   └── useInfiniteScroll.js
│   │   ├── utils/         # Utility functions
│   │   │   ├── csvExport.js
│   │   │   └── dateHelpers.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Backend Express server
│   ├── src/
│   │   ├── routes/       # API routes
│   │   │   └── filings.js
│   │   ├── services/     # Business logic
│   │   │   ├── secAPI.js
│   │   │   ├── fmpAPI.js
│   │   │   └── dataProcessor.js
│   │   ├── utils/        # Utilities
│   │   │   └── rateLimiter.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- Financial Modeling Prep API key (from https://site.financialmodelingprep.com/)

### Installation

1. **Clone the repository**
   ```bash
   cd filter-1
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```bash
   cd ../server
   cp .env.example .env
   ```
   
   Edit `.env` and add your API key:
   ```
   PORT=3001
   FMP_API_KEY=your_actual_api_key_here
   ```

### Running the Application

1. **Start the backend server** (in `server` directory):
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:3001

2. **Start the frontend** (in `client` directory, new terminal):
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:3000

3. **Open your browser** and navigate to http://localhost:3000

## Usage

1. **Set Filters**:
   - Select a date range (or use quick shortcuts)
   - Choose a filing type (e.g., 10-K, 8-K)
   - Optionally set market cap range

2. **Search**:
   - Click "Search Filings" to fetch results
   - Results will load with infinite scroll

3. **Export**:
   - Click "Export to CSV" to download all matching results
   - The export will fetch ALL pages from SEC API automatically

## API Endpoints

### `POST /api/filings`
Fetch paginated SEC filings with filters

**Request Body**:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "fileType": "10-K",
  "minMarketCap": 1000000000,
  "maxMarketCap": 100000000000,
  "page": 1,
  "limit": 50
}
```

### `POST /api/filings/export`
Fetch ALL SEC filings for export (no pagination)

**Request Body**:
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "fileType": "10-K",
  "minMarketCap": 1000000000,
  "maxMarketCap": 100000000000
}
```

### `GET /api/health`
Health check endpoint

## Performance Considerations

- **Rate Limiting**: SEC API allows 10 requests/second; our implementation uses 8 req/s to be conservative
- **Pagination**: Results are paginated for smooth UI performance
- **Batch Processing**: Market cap data is fetched in batches to optimize API calls
- **Infinite Scroll**: Uses Intersection Observer API for efficient scroll detection

## Data Sources

- **SEC Filings**: https://www.sec.gov/cgi-bin/browse-edgar
- **Market Cap Data**: https://financialmodelingprep.com/

## Notes

- SEC API requires a User-Agent header (automatically included)
- Market cap filtering requires valid ticker symbols from FMP API
- Companies without market cap data will be excluded if market cap filters are applied
- Export functionality fetches ALL pages, which may take time for large date ranges

## License

MIT

