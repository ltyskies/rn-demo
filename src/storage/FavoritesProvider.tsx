import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { isPost, type Post } from '../api/posts';

const STORAGE_KEY = '@rn-demo/favorites:v1';
type FavoritesState = {
  favorites: Post[]; ready: boolean; saving: boolean; error: string;
  toggle: (post: Post) => Promise<void>; clear: () => Promise<void>; retry: () => void;
};
const FavoritesContext = createContext<FavoritesState | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Post[]>([]);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const lock = useRef(false);

  useEffect(() => {
    let mounted = true;
    setError('');
    // 先恢复数据，再允许写入，避免用初始空数组覆盖已有收藏。
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      const parsed: unknown = raw === null ? [] : JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.every(isPost)) throw new Error('invalid storage');
      if (mounted) { setFavorites(parsed); setReady(true); }
    }).catch(() => {
      if (mounted) setError('读取收藏失败，请重试；已有数据不会被覆盖。');
    });
    return () => { mounted = false; };
  }, [attempt]);

  async function persist(next: Post[], remove = false) {
    if (!ready || lock.current) return;
    lock.current = true;
    setSaving(true);
    setError('');
    try {
      // AsyncStorage 只保存字符串；先写入成功，再更新所有页面共享的状态。
      if (remove) await AsyncStorage.removeItem(STORAGE_KEY);
      else await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setFavorites(next);
    } catch {
      setError('保存收藏失败，请再次操作。');
    } finally { lock.current = false; setSaving(false); }
  }

  return <FavoritesContext.Provider value={{
    favorites, ready, saving, error,
    toggle: post => persist(favorites.some(item => item.id === post.id)
      ? favorites.filter(item => item.id !== post.id) : [post, ...favorites]),
    clear: () => persist([], true), retry: () => setAttempt(value => value + 1),
  }}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('useFavorites 必须在 FavoritesProvider 中使用');
  return value;
}
