import { useState, useCallback, useRef } from "react";

/**
 * usePagination — manages cursor-based pagination state for dashboard list pages.
 *
 * Works with the babit backend's page_size / page_token / next_page_token protocol.
 * The hook accumulates items across pages so the UI can render a growing list
 * with a "Load more" button.
 */
export function usePagination<T>() {
  const [items, setItems] = useState<T[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const currentPageToken = useRef<string>("");

  const fetchPage = useCallback(
    async (
      fetcher: (params: { page_size: number; page_token: string }) => Promise<{
        items: T[];
        next_page_token?: string;
      }>,
      pageSize: number = 50,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const pageToken = currentPageToken.current;
        const res = await fetcher({ page_size: pageSize, page_token: pageToken });
        setItems((prev) => (pageToken === "" ? res.items : [...prev, ...res.items]));
        setNextPageToken(res.next_page_token ?? "");
        setHasInitialLoaded(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "failed to load");
        setHasInitialLoaded(true);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadMore = useCallback(
    async (
      fetcher: (params: { page_size: number; page_token: string }) => Promise<{
        items: T[];
        next_page_token?: string;
      }>,
      pageSize: number = 50,
    ) => {
      if (!nextPageToken || loading) return;
      currentPageToken.current = nextPageToken;
      await fetchPage(fetcher, pageSize);
    },
    [nextPageToken, loading, fetchPage],
  );

  const reset = useCallback(() => {
    currentPageToken.current = "";
    setItems([]);
    setNextPageToken("");
    setError(null);
    setHasInitialLoaded(false);
  }, []);

  const refresh = useCallback(
    async (
      fetcher: (params: { page_size: number; page_token: string }) => Promise<{
        items: T[];
        next_page_token?: string;
      }>,
      pageSize: number = 50,
    ) => {
      reset();
      currentPageToken.current = "";
      await fetchPage(fetcher, pageSize);
    },
    [reset, fetchPage],
  );

  return {
    items,
    loading,
    error,
    nextPageToken,
    hasMore: !!nextPageToken,
    hasInitialLoaded,
    fetchPage,
    loadMore,
    refresh,
    reset,
  };
}
