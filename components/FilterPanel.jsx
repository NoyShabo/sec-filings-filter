'use client'

import { useState } from 'react'
import { getDateRange } from '../utils/dateHelpers'

const FILE_TYPES = [
  '10-K',
  '10-Q',
  '8-K',
  '13F',
  '13F-HR',
  '13F-NT',
  'F-1',
  'S-1',
  'S-3',
  'S-4',
  'S-8',
  '20-F',
  '6-K',
  'DEF 14A',
  'DEFA14A',
];

export function FilterPanel({ onSearch, loading }) {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    fileType: '10-K',
    minMarketCap: '',
    maxMarketCap: '',
  });

  const handleDateShortcut = (days) => {
    const { startDate, endDate } = getDateRange(days);
    setFilters(prev => ({ ...prev, startDate, endDate }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!filters.startDate || !filters.endDate || !filters.fileType) {
      alert('Please fill in all required fields: Start Date, End Date, and File Type');
      return;
    }

    // Check if date range is too old (SEC API limitation)
    const today = new Date();
    const startDate = new Date(filters.startDate);
    const daysAgo = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    
    if (daysAgo > 30) {
      const confirmed = window.confirm(
        `⚠️ Warning: SEC API Limitation\n\n` +
        `You selected a date range ${daysAgo} days ago.\n\n` +
        `The SEC's "getcurrent" API only returns recent filings (typically last 30 days). ` +
        `You may not get complete results for older dates.\n\n` +
        `For best results, use date ranges within the last 30 days.\n\n` +
        `Continue anyway?`
      );
      if (!confirmed) return;
    }

    // Convert market cap strings to numbers
    const searchFilters = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      fileType: filters.fileType,
      minMarketCap: filters.minMarketCap ? parseFloat(filters.minMarketCap) : undefined,
      maxMarketCap: filters.maxMarketCap ? parseFloat(filters.maxMarketCap) : undefined,
    };

    onSearch(searchFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Filter SEC Filings</h2>
      
      {/* SEC API Limitation Notice */}
      <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> The SEC API typically returns filings from the <strong>last 30 days</strong>. 
              For best results, use recent date ranges (Last 7 or 30 days).
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-xs text-gray-600 mb-1">
                From
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-xs text-gray-600 mb-1">
                To
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          {/* Quick Date Shortcuts */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleDateShortcut(7)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => handleDateShortcut(30)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => handleDateShortcut(60)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last 60 Days
            </button>
            <button
              type="button"
              onClick={() => handleDateShortcut(90)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Last 90 Days
            </button>
          </div>
        </div>

        {/* File Type */}
        <div>
          <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-2">
            Filing Type
          </label>
          <select
            id="fileType"
            name="fileType"
            value={filters.fileType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {FILE_TYPES.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Market Cap Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Market Cap Range (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minMarketCap" className="block text-xs text-gray-600 mb-1">
                Min ($)
              </label>
              <input
                type="number"
                id="minMarketCap"
                name="minMarketCap"
                value={filters.minMarketCap}
                onChange={handleInputChange}
                placeholder="e.g., 1000000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="maxMarketCap" className="block text-xs text-gray-600 mb-1">
                Max ($)
              </label>
              <input
                type="number"
                id="maxMarketCap"
                name="maxMarketCap"
                value={filters.maxMarketCap}
                onChange={handleInputChange}
                placeholder="e.g., 100000000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Tip: $1B = 1,000,000,000 | $10B = 10,000,000,000 | $100B = 100,000,000,000
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search Filings'}
        </button>
      </form>
    </div>
  );
}

