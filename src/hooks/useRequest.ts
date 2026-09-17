import { useCallback, useEffect, useRef, useState } from 'react';

export function useRequest<T>(loader: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    setLoading(true);
    setError('');
    try {
      const result = await loader(controller.signal);
      if (active.current === controller && !controller.signal.aborted) setData(result);
    } catch (cause) {
      if (active.current !== controller) return;
      if (timedOut) setError('请求超时，请检查网络后重试');
      else if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : '网络请求失败，请重试');
      }
    } finally {
      clearTimeout(timer);
      if (active.current === controller) setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    setData(undefined);
    void reload();
    return () => { active.current?.abort(); active.current = null; };
  }, [reload]);

  return { data, loading, error, reload };
}
