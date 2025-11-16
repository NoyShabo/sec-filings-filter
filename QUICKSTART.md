# Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

## Step 2: Configure API Key

```bash
# In the server directory, create .env file
cd ../server
cp .env.example .env
```

Edit `.env` and add your Financial Modeling Prep API key:
```
PORT=3001
FMP_API_KEY=your_actual_api_key_here
```

**Get your API key**: https://site.financialmodelingprep.com/developer/docs

## Step 3: Start the Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## Step 4: Open the App

Navigate to: **http://localhost:3000**

## Step 5: Try It Out

1. **Quick Test**:
   - Click "Last 30 Days" button
   - Keep default file type "10-K"
   - Click "Search Filings"

2. **With Market Cap Filter**:
   - Set date range
   - Choose file type (e.g., "8-K")
   - Set Min Market Cap: `1000000000` (1 billion)
   - Set Max Market Cap: `100000000000` (100 billion)
   - Click "Search Filings"

3. **Export Results**:
   - After searching, click "Export to CSV"
   - Wait for all pages to load
   - CSV will download automatically

## Troubleshooting

### "Cannot find module" error
```bash
# Make sure you ran npm install in BOTH directories
cd server && npm install
cd ../client && npm install
```

### "FMP_API_KEY is not configured"
- Make sure `.env` file exists in `/server` directory
- Check that API key is correct
- No quotes needed around the key

### "SEC API rate limit exceeded"
- Wait a moment and try again
- The app respects rate limits automatically

### No market cap data showing
- Free tier API has limited calls (250/day)
- Some companies don't have ticker symbols
- Try with well-known companies (large cap stocks)

## Example Searches

### Large Cap Tech Filings
- Date: Last 30 days
- Type: 8-K
- Min Market Cap: 100000000000 (100B)
- Max Market Cap: 3000000000000 (3T)

### Mid Cap 10-K Reports
- Date: Last 90 days
- Type: 10-K
- Min Market Cap: 2000000000 (2B)
- Max Market Cap: 10000000000 (10B)

### Recent 13F Filings (Any Size)
- Date: Last 7 days
- Type: 13F-HR
- No market cap filters

## Next Steps

- Read the full README.md for detailed documentation
- Check memory-bank/ folder for project context
- Review .cursorrules for implementation patterns
- Explore the code structure

## Support

If you encounter issues:
1. Check browser console (F12) for errors
2. Check backend terminal for API errors
3. Verify SEC.gov and FMP API are accessible
4. Review the troubleshooting section above

Happy searching! 🚀

