'use client'

import { useState } from 'react'
import FilterPanel from '../components/FilterPanel'
import FilingsList from '../components/FilingsList'
import ExportButton from '../components/ExportButton'
import { useSECFilings } from '../hooks/useSECFilings'

export default function Home() {
  const [currentFilters, setCurrentFilters] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { loading, error, data, pagination, fetchFilings, fetchAllFilings, reset } = useSECFilings()

  const handleSearch = async (filters) => {
    // Reset previous results
    reset()
    setCurrentPage(1)
    setCurrentFilters(filters)
    
    // Fetch first page
    await fetchFilings(filters, 1)
  }

  const handleLoadMore = async () => {
    if (!currentFilters || loading || !pagination?.hasMore) return
    
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    await fetchFilings(currentFilters, nextPage)
  }

  const handleExport = async (filters) => {
    return await fetchAllFilings(filters)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">SEC Filings Filter</h1>
          <p className="mt-2 text-sm text-gray-600">
            Search and filter SEC filings with advanced market cap controls
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FilterPanel onSearch={handleSearch} loading={loading} />

        {/* Results Section */}
        {(data.length > 0 || loading || error) && (
          <div>
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                {pagination && (
                  <p className="text-gray-700">
                    Showing <span className="font-semibold">{data.length}</span> of{' '}
                    <span className="font-semibold">{pagination.totalResults}</span> results
                  </p>
                )}
              </div>
              <ExportButton
                filters={currentFilters}
                onExport={handleExport}
                disabled={!currentFilters || data.length === 0}
              />
            </div>

            {/* Filings List */}
            <FilingsList
              filings={data}
              loading={loading}
              error={error}
              onLoadMore={handleLoadMore}
              hasMore={pagination?.hasMore || false}
            />
          </div>
        )}

        {/* Welcome Message */}
        {!loading && data.length === 0 && !error && !currentFilters && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Welcome!</h3>
            <p className="mt-2 text-gray-500">
              Set your filters above and click &quot;Search Filings&quot; to get started
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Data sourced from SEC.gov and Financial Modeling Prep API
          </p>
        </div>
      </footer>
    </div>
  )
}

