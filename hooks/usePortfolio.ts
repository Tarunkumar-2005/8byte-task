'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PortfolioApiResponse } from '@/types/portfolio';

const REFRESH_INTERVAL_SECONDS = 15;

export function usePortfolio() {
  const [data, setData] = useState<PortfolioApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(REFRESH_INTERVAL_SECONDS);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);

  const isMountedRef = useRef<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);

  const fetchPortfolio = useCallback(
    async (isManualRefresh = false) => {
      // Prevent overlapping  duplicate requests
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isManualRefresh) {
        setIsRefreshing(true);
      }

      try {
        const url = isManualRefresh
          ? '/api/portfolio?refresh=true'
          : '/api/portfolio';

        const response = await fetch(url, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache' },
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`);
        }

        const json: PortfolioApiResponse = await response.json();

        if (isMountedRef.current) {
          if (json.success) {
            setData(json);
            setError(null);
          } else {
            setError((json as any).error || 'Failed to load portfolio data');
          }
        }
      } catch (err: any) {
        console.error('[usePortfolio] Error fetching data:', err);
        if (isMountedRef.current) {
          // If we don't have existing data, show error prominently.
          // If we have existing data, keep displaying it but show error notification.
          setError(err.message || 'Network error fetching live market data');
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
          setSecondsUntilRefresh(REFRESH_INTERVAL_SECONDS);
          isFetchingRef.current = false;
        }
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    isMountedRef.current = true;
    fetchPortfolio(false);

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchPortfolio]);

  // 15-second automatic refresh controller & 1-second countdown ticker
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const ticker = setInterval(() => {
      // Pause ticker if document is hidden to conserve bandwidth
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          // Trigger refresh
          fetchPortfolio(false);
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [autoRefreshEnabled, fetchPortfolio]);

  // Listen for tab focus to instantly refresh if stale
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPortfolio(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchPortfolio]);

  const handleManualRefresh = () => {
    setSecondsUntilRefresh(REFRESH_INTERVAL_SECONDS);
    fetchPortfolio(true);
  };

  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled((prev) => !prev);
  };

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    secondsUntilRefresh,
    autoRefreshEnabled,
    refresh: handleManualRefresh,
    toggleAutoRefresh,
  };
}
