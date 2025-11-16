import { subDays, format } from 'date-fns';

/**
 * Get date range for last N days
 * @param {number} days - Number of days to go back
 * @returns {Object} Object with startDate and endDate in YYYY-MM-DD format
 */
export function getDateRange(days) {
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
  };
}

/**
 * Format date for display
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return dateString;
  }
}

/**
 * Format date for SEC API (YYYYMMDD)
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Date in YYYYMMDD format
 */
export function formatDateForAPI(dateString) {
  return dateString.replace(/-/g, '');
}

