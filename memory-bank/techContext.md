# Technical Context

## Technologies Used

### Frontend Stack

#### Core
- **Vite 5.x** - Build tool and dev server
  - Fast HMR (Hot Module Replacement)
  - Optimized production builds
  - Native ES modules support

- **React 18.x** - UI library
  - Functional components
  - Hooks for state and effects
  - StrictMode enabled

- **Tailwind CSS 3.x** - Styling
  - Utility-first approach
  - Responsive design utilities
  - Custom configuration support

#### Utilities
- **Axios** - HTTP client for API calls
- **date-fns** - Date manipulation and formatting
- **Intersection Observer API** - Infinite scroll detection

### Backend Stack

#### Core
- **Node.js 18+** - Runtime environment
  - ES modules (type: "module")
  - Native async/await support

- **Express 4.x** - Web framework
  - RESTful API endpoints
  - Middleware support
  - JSON body parsing

#### Key Libraries
- **p-queue 8.x** - Rate limiting and request queuing
- **Axios** - External API calls
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm (comes with Node.js)
- Financial Modeling Prep API key

### Environment Variables
```
PORT=3001
FMP_API_KEY=your_api_key_here
```

### Development Scripts

**Backend** (`/server`):
```bash
npm run dev    # Run with --watch flag (auto-reload)
npm start      # Production mode
```

**Frontend** (`/client`):
```bash
npm run dev    # Development server (port 3000)
npm run build  # Production build
npm run preview # Preview production build
```

### Port Configuration
- Frontend: `3000` (Vite dev server)
- Backend: `3001` (Express server)
- Proxy: Frontend proxies `/api` requests to backend

## Technical Constraints

### SEC API Limitations
- **Rate Limit**: 10 requests per second
- **User-Agent Required**: Must provide identifying header
- **Response Format**: XML/ATOM (requires parsing)
- **Pagination**: 100 results per page maximum
- **No Authentication**: Public API

### Financial Modeling Prep API
- **Rate Limit**: Varies by plan (free tier: 250 calls/day)
- **Authentication**: API key required
- **Response Format**: JSON
- **Endpoints Used**:
  - `/market-capitalization/{ticker}`
  - `/profile/{ticker}`
  - `/cik-search/{cik}`
  - `/search?query={name}`

### Browser Compatibility
- Modern browsers with ES6+ support
- Intersection Observer API support
- Fetch API support
- No IE11 support

## Data Models

### SEC Filing Object
```javascript
{
  company: string,
  cik: string,
  formType: string,
  filingDate: string,
  fileNumber: string,
  filingUrl: string,
  title: string
}
```

### Enriched Filing Object
```javascript
{
  company: string,
  ticker: string,
  cik: string,
  formType: string,
  filingDate: string,
  marketCap: number | null,
  industry: string,
  sector: string,
  filingUrl: string,
  fileNumber: string
}
```

### API Request Format
```javascript
{
  startDate: string,      // YYYY-MM-DD
  endDate: string,        // YYYY-MM-DD
  fileType: string,       // e.g., "10-K"
  minMarketCap: number,   // Optional
  maxMarketCap: number,   // Optional
  page: number,           // For paginated endpoint
  limit: number          // Results per page
}
```

## Dependencies

### Production Dependencies

**Frontend**:
- react: ^18.2.0
- react-dom: ^18.2.0
- axios: ^1.6.2
- date-fns: ^3.0.6

**Backend**:
- express: ^4.18.2
- cors: ^2.8.5
- axios: ^1.6.2
- p-queue: ^8.0.1
- dotenv: ^16.3.1

### Development Dependencies

**Frontend**:
- @vitejs/plugin-react: ^4.2.1
- tailwindcss: ^3.3.6
- postcss: ^8.4.32
- autoprefixer: ^10.4.16
- vite: ^5.0.8

## Build and Deployment

### Frontend Build
```bash
cd client
npm run build
# Output: client/dist/
```

### Backend Deployment
- Node.js 18+ runtime required
- Set environment variables
- Run `npm start` or use process manager (PM2)

### Production Considerations
- Set proper CORS origins
- Use process manager (PM2, systemd)
- Implement proper logging
- Monitor API rate limits
- Consider caching layer
- Load balancing for scale

