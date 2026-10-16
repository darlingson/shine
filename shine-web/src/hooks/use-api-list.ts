import { useCallback, useEffect, useState } from "react";
import { parseApiError } from "@/lib/users";

/** Shared list fetching: loading/error states plus unmount safety. */
export function useApiList<T>(fetch: () => Promise<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetch());
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller passes a stable fetcher
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await fetch();
        if (!cancelled) {
          setItems(all);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(parseApiError(e));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch-once on mount
  }, []);

  return { items, loading, error, refresh, setItems };
}
