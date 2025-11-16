# SEC Filings Filter - Next.js

A powerful full-stack web application built with **Next.js 14** to search and filter SEC filings from sec.gov with advanced market cap controls.

## 🚀 Features

- **Date Range Filtering**: Search filings by custom date ranges with quick shortcuts (7, 30, 60, 90 days)
- **Filing Type Selection**: Filter by 10-K, 10-Q, 8-K, 13F, and more
- **Market Cap Filtering**: Set min/max market capitalization ranges
- **Company Data Enrichment**: Automatically fetches ticker symbols, market cap, industry, and sector data
- **Infinite Scroll**: Seamlessly load more results as you scroll
- **CSV Export**: Export all filtered results to CSV with one click
- **Direct Filing Access**: Quick links to view official SEC documents

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **API Routes**: Next.js API Routes (serverless functions)
- **Backend Services**: Node.js with rate-limited API clients
- **External APIs**:
  - SEC EDGAR API (public filings data)
  - Financial Modeling Prep API (company data, market cap)

## 📦 Project Structure

```
filter-1/
├── app/
│   ├── api/                    # Next.js API routes
│   │   ├── filings/route.js   # Paginated filings endpoint
│   │   ├── export/route.js    # Full export endpoint
│   │   └── health/route.js    # Health check
│   ├── layout.js              # Root layout
│   ├── page.js                # Home page
│   └── globals.css            # Global styles
├── components/                 # React components
│   ├── FilterPanel.jsx        # Search filters UI
│   ├── FilingsList.jsx        # Results display with infinite scroll
│   └── ExportButton.jsx       # CSV export button
├── hooks/                      # Custom React hooks
│   ├── useSECFilings.js       # API integration hook
│   └── useInfiniteScroll.js   # Infinite scroll logic
├── utils/                      # Utility functions
│   ├── dateHelpers.js         # Date formatting
│   └── csvExport.js           # CSV generation
├── server/                     # Backend services
│   └── src/
│       ├── services/          # API clients
│       │   ├── secAPI.js      # SEC EDGAR integration
│       │   ├── fmpAPI.js      # Financial Modeling Prep integration
│       │   ├── dataProcessor.js  # Data merging and filtering
│       │   └── stockListCache.js # Stock list caching
│       └── utils/
│           └── rateLimiter.js # Rate limiting for SEC API
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── package.json               # Dependencies and scripts
```

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+ and npm
- Financial Modeling Prep API key ([Get one here](https://site.financialmodelingprep.com/developer/docs))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/NoyShabo/sec-filings-filter.git
cd sec-filings-filter
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env.local` file**
```bash
echo "FMP_API_KEY=your_api_key_here" > .env.local
```

Replace `your_api_key_here` with your actual Financial Modeling Prep API key.

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel (Recommended)

### One-Click Deploy

The easiest way to deploy your Next.js app is to use the Vercel platform.

### Step 1: Import Your Project

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select: **`NoyShabo/sec-filings-filter`**

### Step 2: Configure Environment Variables

In the Vercel dashboard:

1. Click **"Environment Variables"**
2. Add:
   - **Name**: `FMP_API_KEY`
   - **Value**: `your_actual_api_key`
3. Click **"Add"**

### Step 3: Deploy

Click **"Deploy"** and wait for Vercel to build and deploy your app!

Your app will be live at: `https://your-project-name.vercel.app`

## 📚 API Documentation

### POST `/api/filings`

Fetch paginated SEC filings with filters.

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "fileType": "10-K",
  "minMarketCap": 1000000000,
  "maxMarketCap": 100000000000,
  "page": 1,
  "limit": 50
}
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalResults": 250,
    "resultsPerPage": 50,
    "hasMore": true
  }
}
```

### POST `/api/export`

Fetch ALL filings matching the filters (for CSV export).

**Request Body:**
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "fileType": "10-K",
  "minMarketCap": 1000000000,
  "maxMarketCap": 100000000000
}
```

**Response:**
```json
{
  "data": [...],
  "total": 250
}
```

## 🔧 Configuration

### Rate Limiting

The SEC EDGAR API has a rate limit of **10 requests per second**. This project uses `p-queue` to automatically throttle requests to **8 req/sec** for safety.

Configuration in `server/src/utils/rateLimiter.js`:
```javascript
const queue = new PQueue({
  concurrency: 1,
  interval: 1000,
  intervalCap: 8,
});
```

### Market Cap Caching

To reduce API calls to Financial Modeling Prep, the app caches the full stock list on first request. Cache is stored in memory and lasts for the serverless function lifetime.

## 🎯 Usage Tips

1. **Start with small date ranges** (7-30 days) to test the filters
2. **Market cap is optional** - leave blank to see all companies
3. **Export can take time** for large date ranges (90+ days)
4. **N/A values** mean the data wasn't available from the API

## 🐛 Troubleshooting

### No results showing
- Check that your date range has filings for that file type
- Try a larger date range (e.g., Last 90 Days)
- Remove market cap filters to see if data is available

### Market Cap showing N/A
- Some companies don't have public market cap data
- Small/private companies won't have this information
- The app continues to show these companies with "N/A"

### Export timing out
- Vercel serverless functions have a 60-second timeout
- For very large exports, consider smaller date ranges
- Pro Vercel accounts have longer timeouts

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `FMP_API_KEY` | Financial Modeling Prep API key | Yes |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🔗 Links

- [SEC EDGAR API Documentation](https://www.sec.gov/edgar/sec-api-documentation)
- [Financial Modeling Prep API](https://site.financialmodelingprep.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Docs](https://vercel.com/docs)

---

Built with ❤️ using Next.js 14
