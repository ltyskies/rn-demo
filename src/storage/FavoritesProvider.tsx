// AsyncStorage 是异步键值存储；React Context 用于跨页面共享已读入内存的收藏。
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { isPost, type Post } from '../api/posts';

// 命名空间避免与其他功能撞键；v1 标识数据格式版本（此示例未实现版本迁移）。
const STORAGE_KEY = '@rn-demo/favorites:v1';
// Provider 暴露的公共接口：数组、读取/写入状态、错误，以及三个操作函数。
// ready 表示首次恢复成功；saving 表示正在保存；retry 只重试读取。
type FavoritesState = {
  favorites: Post[]; ready: boolean; saving: boolean; error: string;
  toggle: (post: Post) => Promise<void>; clear: () => Promise<void>; retry: () => void;
};
// null 表示组件树里没有对应 Provider，方便在 useFavorites 中发现误用。
const FavoritesContext = createContext<FavoritesState | null>(null);

// 根布局包裹此组件，children 就是所有路由页面；切换页面不会重新创建这份状态。
export function FavoritesProvider({ children }: { children: ReactNode }) {
  // React state 驱动界面，AsyncStorage 驱动重启后的恢复，两者职责不同。
  const [favorites, setFavorites] = useState<Post[]>([]);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  // ref 是同步锁：连续点击时立即生效，不必等待 setSaving 引发下一次渲染。
  const lock = useRef(false);

  useEffect(() => {
    // 存储读取没有在此使用取消 API，因此通过标记忽略卸载后的异步结果。
    let mounted = true;
    setError('');
    // 先恢复数据，再允许写入，避免用初始空数组覆盖已有收藏。
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      // 首次运行时键不存在，返回 null；有值时用 JSON.parse 还原数组。
      // unknown 强制后续校验，避免把损坏或旧格式的数据直接交给界面。
      const parsed: unknown = raw === null ? [] : JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.every(isPost)) throw new Error('invalid storage');
      if (mounted) { setFavorites(parsed); setReady(true); }
    }).catch(() => {
      // 读失败或 JSON/结构不合法时，ready 保持 false，禁止写入覆盖原数据。
      if (mounted) setError('读取收藏失败，请重试；已有数据不会被覆盖。');
    });
    return () => { mounted = false; };
    // retry 增加 attempt，触发 effect 再读一次；它不直接修改收藏内容。
  }, [attempt]);

  // 所有写操作共用一个入口：next 是完整的新数组，remove 表示删除存储键。
  async function persist(next: Post[], remove = false) {
    // 初始数据未恢复、或已有写入进行时，不接受新的写操作。
    if (!ready || lock.current) return;
    lock.current = true;
    setSaving(true);
    setError('');
    try {
      // AsyncStorage 只保存字符串；先写入成功，再更新所有页面共享的状态。
      if (remove) await AsyncStorage.removeItem(STORAGE_KEY);
      else await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      // 保存成功后再更新内存，所以失败时界面仍保持最后一次成功的收藏状态。
      setFavorites(next);
    } catch {
      setError('保存收藏失败，请再次操作。');
    } finally {
      // 无论成功失败都解锁，允许用户继续操作或重试保存。
      lock.current = false;
      setSaving(false);
    }
  }

  // value 将状态与操作提供给全部后代；收藏变化会使订阅的页面重新渲染。
  return <FavoritesContext.Provider value={{
    favorites, ready, saving, error,
    // some 判断是否已收藏；有则 filter 删除，无则展开原数组并在首位插入。
    // 始终创建新数组，不原地修改 state；同时保存正文，支持离线展示。
    toggle: post => persist(favorites.some(item => item.id === post.id)
      ? favorites.filter(item => item.id !== post.id) : [post, ...favorites]),
    // 仅移除本功能的键，不调用 AsyncStorage.clear()，避免清掉其他功能数据。
    clear: () => persist([], true),
    // 函数式更新根据最新计数加一，触发上面的读取 effect。
    retry: () => setAttempt(value => value + 1),
  }}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  // 自定义 Hook 封装 Context 的读取与空值检查，让页面无需重复判空。
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('useFavorites 必须在 FavoritesProvider 中使用');
  return value;
}
