import { useEffect, useState } from "react";
import type { TableRowsResult } from "../config/types";
type TableRowsRequestOptions<Row> = {
  enabled?: boolean;
  refreshKey?: number;
  request: () => Promise<Row[]>;
};

export function useTableRowsRequest<Row>({
  enabled = true,
  refreshKey,
  request,
}: TableRowsRequestOptions<Row>): TableRowsResult<Row> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!enabled) {
        setRows([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await request();
        if (!cancelled) setRows(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load rows");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [enabled, request, refreshKey]);

  return { rows, loading, error };
}
