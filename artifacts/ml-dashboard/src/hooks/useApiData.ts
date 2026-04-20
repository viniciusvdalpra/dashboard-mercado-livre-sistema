import { useState, useEffect } from "react";
import { api, IS_MOCK } from "@/lib/api";

/**
 * Hook that fetches data from API when IS_MOCK is false.
 * Returns mock data as fallback/initial state.
 * When transform is provided, it transforms the raw API response.
 * The returned data can be null (when API hasn't loaded yet and mockData is null).
 */
export function useApiData<T, R = T>(
  path: string | null,
  mockData: T,
  transform?: (raw: any) => R,
  deps: any[] = [],
): { data: T | R; loading: boolean } {
  const [data, setData] = useState<T | R>(mockData);
  const [loading, setLoading] = useState(!IS_MOCK && !!path);

  useEffect(() => {
    if (IS_MOCK || !path) {
      setData(mockData);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api.get(path)
      .then((raw) => {
        if (cancelled) return;
        setData(transform ? transform(raw) : raw);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(`[useApiData] ${path} failed, using mock:`, err);
        setData(mockData);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, IS_MOCK, ...deps]);

  return { data, loading };
}
