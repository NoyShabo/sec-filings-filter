/**
 * Format market cap for CSV
 * @param {number} marketCap - Market cap value
 * @returns {string} Formatted market cap
 */
function formatMarketCap(marketCap) {
  if (!marketCap) return 'N/A';
  return marketCap.toLocaleString();
}

/**
 * Convert data array to CSV string
 * @param {Array} data - Array of filing objects
 * @returns {string} CSV string
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return '';
  }

  // Define headers
  const headers = [
    'Company',
    'Ticker',
    'CIK',
    'Filing Type',
    'Filing Date',
    'Market Cap',
    'Industry',
    'Sector',
    'Filing URL',
  ];

  // Create CSV rows
  const rows = data.map((filing) => {
    return [
      `"${filing.company || 'N/A'}"`,
      filing.ticker || 'N/A',
      filing.cik || 'N/A',
      filing.formType || 'N/A',
      filing.filingDate || 'N/A',
      `"${formatMarketCap(filing.marketCap)}"`, // Quote the market cap to handle commas
      `"${filing.industry || 'N/A'}"`,
      `"${filing.sector || 'N/A'}"`,
      filing.filingUrl || 'N/A',
    ].join(',');
  });

  // Combine headers and rows
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Download CSV file
 * @param {Array} data - Array of filing objects
 * @param {string} filename - Name of the file to download
 */
export function downloadCSV(data, filename = 'sec-filings-export.csv') {
  const csv = convertToCSV(data);
  
  if (!csv) {
    console.error('No data to export');
    return;
  }

  // Create blob and download link
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with timestamp
 * @param {Object} filters - Filter parameters
 * @returns {string} Filename
 */
export function generateFilename(filters) {
  const timestamp = new Date().toISOString().split('T')[0];
  const fileType = filters.fileType || 'all';
  return `sec-filings-${fileType}-${timestamp}.csv`;
}

