import { useState, useEffect, useCallback } from 'react';
import { fetchCallLogs } from '../api/callLogs';
import { AUDIT_CATEGORY } from '../config';
import type { CallLogsResponse, CallLogsParams } from '../types';

interface UseCallLogsState {
  data: CallLogsResponse | null;
  loading: boolean;
  error: string | null;
}

export function useCallLogs(params: Omit<CallLogsParams, 'category'>) {
  const [state, setState] = useState<UseCallLogsState>({
    data: null,
    loading: true,
    error: null,
  });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchCallLogs({ ...params, category: AUDIT_CATEGORY })
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) =>
        setState({ data: null, loading: false, error: err.message || 'Unknown error' })
      );
  }, [
    params.pageNumber,
    params.pageSize,
    params.intents,
    params.mobileNumber,
    params.isMobile,
    params.alfursanId,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refetch: load };
}
