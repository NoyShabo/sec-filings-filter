import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for infinite scroll functionality
 * @param {Function} onIntersect - Callback when intersection occurs
 * @param {boolean} loading - Loading state
 * @param {boolean} hasMore - Whether there are more items to load
 */
export function useInfiniteScroll(onIntersect, loading, hasMore) {
  const observerRef = useRef(null);
  const targetRef = useRef(null);

  const handleIntersect = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !loading && hasMore) {
      onIntersect();
    }
  }, [onIntersect, loading, hasMore]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observerRef.current.observe(currentTarget);
    }

    return () => {
      if (observerRef.current && currentTarget) {
        observerRef.current.unobserve(currentTarget);
      }
    };
  }, [handleIntersect]);

  return targetRef;
}

