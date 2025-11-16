'use client'

import { useState, useCallback } from 'react'
import axios from 'axios'

/**
 * Custom hook for fetching SEC filings
 */
export function useSECFilings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState(null);

  /**
   * Fetch paginated filings
   */
  const fetchFilings = useCallback(async (filters, page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/filings', {
        ...filters,
        page,
        limit: 50,
      });

      if (page === 1) {
        setData(response.data.data);
      } else {
        // Append to existing data for infinite scroll
        setData(prevData => [...prevData, ...response.data.data]);
      }

      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching filings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch filings');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all filings for export
   */
  const fetchAllFilings = useCallback(async (filters) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/export', filters);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching all filings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch filings for export');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset data and pagination
   */
  const reset = useCallback(() => {
    setData([]);
    setPagination(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    data,
    pagination,
    fetchFilings,
    fetchAllFilings,
    reset,
  };
}

