import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

export function useApiResource(path, initialData = null) {
  const initialDataRef = useRef(initialData);
  const [state, setState] = useState({ data: initialDataRef.current, loading: true, error: '' });
  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, loading: true, error: '' }));
    api.get(path, { signal: controller.signal })
      .then(({ data }) => setState({ data: data.data, loading: false, error: '' }))
      .catch((error) => {
        if (error.code !== 'ERR_CANCELED') setState({ data: initialDataRef.current, loading: false, error: error.response?.data?.message || 'This content is temporarily unavailable.' });
      });
    return () => controller.abort();
  }, [path]);
  return state;
}
