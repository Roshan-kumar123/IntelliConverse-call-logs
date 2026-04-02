import { useState, useEffect } from 'react';
import { fetchCallDetail } from '../api/callLogs';
import type { CallDetail } from '../types';

interface UseCallDetailState {
  data: CallDetail | null;
  loading: boolean;
  error: string | null;
}

export function useCallDetail(id: string | undefined) {
  const [state, setState] = useState<UseCallDetailState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({ data: null, loading: false, error: 'No ID provided' });
      return;
    }
    setState({ data: null, loading: true, error: null });
    fetchCallDetail(id)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) =>
        setState({ data: null, loading: false, error: err.message || 'Unknown error' })
      );
  }, [id]);

  return state;
}
