# System Patterns

## Architecture Overview

### Monorepo Structure
- `/client` - Frontend React application
- `/server` - Backend Express API
- Separate package.json for each app
- Vite proxy for API calls during development

### Data Flow Pattern

```
User Input → Frontend → Backend → External APIs → Data Processing → Response
                         ↓
                    SEC API + FMP API
                         ↓
                   Data Processor
                         ↓
                   Merged Results
```

## Key Technical Decisions

### 1. Pagination Strategy
**Decision**: Dual pagination approach
- **Search**: Single page results with infinite scroll
- **Export**: Fetch ALL pages in backend

**Rationale**: 
- Fast initial results for user
- Complete datasets for export
- Backend handles rate limiting

### 2. Rate Limiting
**Decision**: Use p-queue with 8 requests/second for SEC API

**Implementation**:
- Centralized rate limiter utility
- All SEC API calls go through rate limiter
- Conservative limit (8/sec vs SEC's 10/sec maximum)

**Rationale**:
- Respect SEC rate limits
- Prevent 429 errors
- Maintain service reliability

### 3. Market Cap Integration
**Decision**: Convert CIK → Ticker → Market Cap

**Flow**:
1. SEC API returns CIK (Central Index Key)
2. FMP API converts CIK to ticker symbol
3. FMP API fetches company profile with market cap
4. Data processor merges results

**Rationale**:
- SEC and FMP use different identifiers
- Ticker is more flexible for lookups
- Company profiles include additional useful data

### 4. Frontend State Management
**Decision**: Custom hooks without external state library

**Pattern**:
- `useSECFilings` - API calls and data management
- `useInfiniteScroll` - Scroll detection with Intersection Observer
- Local component state for filters

**Rationale**:
- Simple state requirements
- No need for Redux/Zustand overhead
- Custom hooks provide good abstraction

## Component Relationships

### Frontend Components
```
App
├── FilterPanel (user inputs)
├── ExportButton (CSV export)
└── FilingsList (infinite scroll display)
    └── Filing Cards (individual results)
```

### Backend Services
```
Routes (filings.js)
├── SEC API Service (fetch filings)
├── FMP API Service (fetch market cap)
└── Data Processor (merge and filter)
    └── Rate Limiter (control request flow)
```

## Design Patterns Used

### 1. Service Layer Pattern
Separate business logic from route handlers:
- `secAPI.js` - SEC data fetching
- `fmpAPI.js` - Market cap data
- `dataProcessor.js` - Data transformation

### 2. Custom Hooks Pattern
Encapsulate complex logic:
- State management
- Side effects
- Reusable functionality

### 3. Utility Pattern
Shared helper functions:
- Date formatting
- CSV generation
- Market cap formatting

### 4. Observer Pattern
Intersection Observer for infinite scroll:
- Detects when user nears bottom
- Triggers next page load
- Clean, declarative implementation

## Error Handling Strategy

### Frontend
- Display user-friendly error messages
- Maintain app state on errors
- Retry capability through UI

### Backend
- Log detailed errors to console
- Return sanitized errors to client
- Continue processing on individual item failures
- Throw only on critical failures (rate limits, auth)

## Performance Optimizations

### 1. Batch Processing
- Market cap lookups in batches of 10
- Small delays between batches
- Parallel promises within batches

### 2. Efficient Rendering
- React keys for list items
- Intersection Observer (not scroll events)
- Conditional rendering for empty states

### 3. Request Management
- Abort controllers for cancelled requests
- Rate limiting prevents overwhelming APIs
- Progress indicators for long operations

### 4. Data Structure
- Minimal data transformation
- Efficient array operations
- Direct object access (no deep searches)

