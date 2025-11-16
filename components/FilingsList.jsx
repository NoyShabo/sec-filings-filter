'use client'

import React from 'react';
import { formatDate } from '../utils/dateHelpers';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

function formatMarketCap(marketCap) {
  if (!marketCap) return 'N/A';

  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(2)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(2)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(2)}M`;
  } else {
    return `$${marketCap.toLocaleString()}`;
  }
}

export function FilingsList({ filings, loading, error, onLoadMore, hasMore }) {
  const targetRef = useInfiniteScroll(onLoadMore, loading, hasMore);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Error loading filings</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (!loading && filings.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-4 text-gray-600 font-medium">No filings found</p>
        <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filings.map((filing, index) => (
        <div
          key={`${filing.cik}-${filing.filingDate}-${index}`}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-900">{filing.company}</h3>
                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold bg-green-100 text-green-800 border border-green-300">
                  {filing.ticker}
                </span>
                <span className="inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-bold bg-blue-600 text-white shadow-sm">
                  {filing.formType}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>CIK: {filing.cik}</span>
                <span className="text-gray-400">•</span>
                <span className="font-medium text-gray-700">{formatDate(filing.filingDate)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Market Cap</p>
              <p className="text-sm font-medium text-gray-900">{formatMarketCap(filing.marketCap)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Industry</p>
              <p className="text-sm font-medium text-gray-900">{filing.industry || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sector</p>
              <p className="text-sm font-medium text-gray-900">{filing.sector || 'N/A'}</p>
            </div>
          </div>

          {filing.filingUrl && (
            <div className="flex gap-3">
              <a
                href={filing.filingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                View Filing Document
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
              <a
                href={filing.filingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                title="Copy URL"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      ))}

      {/* Infinite scroll trigger element */}
      {hasMore && (
        <div ref={targetRef} className="py-8 text-center">
          {loading && (
            <div className="inline-flex items-center">
              <svg
                className="animate-spin h-6 w-6 text-blue-600 mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-gray-600">Loading more filings...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && filings.length > 0 && (
        <div className="py-8 text-center text-gray-500 text-sm">
          No more results
        </div>
      )}
    </div>
  );
}

