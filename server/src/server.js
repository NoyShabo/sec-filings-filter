import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import filingsRouter from './routes/filings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', filingsRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SEC Filings Filter API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      filings: 'POST /api/filings',
      export: 'POST /api/filings/export',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 SEC Filings Filter Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`FMP API Key configured: ${!!process.env.FMP_API_KEY}\n`);
});

export default app;

