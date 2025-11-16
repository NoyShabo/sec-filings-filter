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

