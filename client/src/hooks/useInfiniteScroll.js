import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (fetchMore, { threshold = 100, hasMore = true } = {}) => {
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  const handleIntersection = useCallback(
    async (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading) {
        setLoading(true);
        try {
          await fetchMore();
        } catch (error) {
          console.error('Failed to fetch more:', error);
        } finally {
          setLoading(false);
        }
      }
    },
    [fetchMore, hasMore, loading]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      rootMargin: `${threshold}px`,
    });

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  return { sentinelRef, loading };
};

export default useInfiniteScroll;
