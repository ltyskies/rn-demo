import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 通用请求 Hook：把页面反复需要的加载、错误、刷新和取消逻辑放在一起。
 * T 是结果类型：列表调用时为 Post[]，详情调用时为 Post。
 * loader 负责具体业务请求；本 Hook 只负责请求生命周期。
 * loader 应保持引用稳定：模块级函数可直接传，依赖参数的函数用 useCallback。
 */
export function useRequest<T>(loader: (signal: AbortSignal) => Promise<T>) {
  // data 初始为 undefined，用来区分“还没拿到结果”和“拿到空数组”。
  const [data, setData] = useState<T>();
  // loading 控制转圈/刷新动画，error 保存可显示给用户的错误文字。
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // ref 跨渲染保留值，修改它不会触发渲染；这里保存当前请求的身份与取消控制器。
  const active = useRef<AbortController | null>(null);

  // useCallback 缓存函数引用，只有 loader 改变时才生成新的 reload。
  const reload = useCallback(async () => {
    // 再次刷新前取消旧请求，避免并行请求浪费资源。
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    // 同样是 abort，需要区分“用户离开/新请求替换”和“15 秒超时”。
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    // 刷新时清除旧错误，但保留已有 data，界面可继续显示上次成功的内容。
    setLoading(true);
    setError('');
    try {
      const result = await loader(controller.signal);
      // 即便旧请求较晚返回，也只有当前且未取消的请求可以提交结果。
      if (active.current === controller && !controller.signal.aborted) setData(result);
    } catch (cause) {
      // 旧请求的失败不应覆盖新请求的状态；主动取消也不显示网络错误。
      if (active.current !== controller) return;
      if (timedOut) setError('请求超时，请检查网络后重试');
      else if (!controller.signal.aborted) {
        setError(cause instanceof Error ? cause.message : '网络请求失败，请重试');
      }
    } finally {
      // 成功、失败、提前 return 都会走 finally，及时移除计时器。
      // 同样要检查身份，防止旧请求把新请求的 loading 错误地关掉。
      clearTimeout(timer);
      if (active.current === controller) setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    // 初次挂载或 loader 变化（例如详情 ID 变化）时清空旧数据并自动加载。
    setData(undefined);
    // void 表示这里不消费返回的 Promise；异常已在 reload 内部捕获。
    void reload();
    // 卸载或依赖变化时执行清理。Stack 中仅失焦但未卸载的页不会因此取消请求。
    // 将 ref 清空，也会让旧请求后续的身份判断失效，阻止它更新状态。
    return () => { active.current?.abort(); active.current = null; };
  }, [reload]);

  // 页面通过解构拿到状态和 reload，同一个 reload 同时服务下拉刷新与重试按钮。
  return { data, loading, error, reload };
}
