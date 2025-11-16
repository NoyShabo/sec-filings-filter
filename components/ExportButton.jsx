'use client'

import React, { useState } from 'react';
import { downloadCSV, generateFilename } from '../utils/csvExport';

export function ExportButton({ filters, onExport, disabled }) {
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');

  const handleExport = async () => {
    if (!filters || !filters.startDate || !filters.endDate || !filters.fileType) {
      alert('Please perform a search before exporting');
      return;
    }

    setExporting(true);
    setExportStatus('Fetching all pages...');

    try {
      const data = await onExport(filters);
      
      if (!data || data.length === 0) {
        alert('No data to export');
        setExportStatus('');
        return;
      }

      setExportStatus(`Generating CSV (${data.length} records)...`);
      
      const filename = generateFilename(filters);
      downloadCSV(data, filename);
      
      setExportStatus('');
      alert(`✅ Successfully exported ${data.length} filings!`);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus('');
      alert('❌ Failed to export data. Please try again.');
    } finally {
      setExporting(false);
      setExportStatus('');
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={disabled || exporting}
      className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {exporting ? (
        <div className="flex flex-col items-center">
          <div className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
            <span>{exportStatus || 'Exporting All Results...'}</span>
          </div>
          <span className="text-xs mt-1 opacity-90">This may take a minute...</span>
        </div>
      ) : (
        <>
          <svg
            className="-ml-1 mr-2 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export All to CSV
        </>
      )}
    </button>
  );
}

