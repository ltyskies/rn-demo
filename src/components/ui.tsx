import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Post } from '../api/posts';
import { useFavorites } from '../storage/FavoritesProvider';

export function Button({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, (disabled || pressed) && { opacity: 0.45 }]}>
    <Text style={styles.buttonText}>{title}</Text>
  </Pressable>;
}

export function StorageNotice() {
  const { ready, error, retry } = useFavorites();
  if (!error && ready) return null;
  return <View style={styles.notice}>
    <Text style={error ? styles.error : styles.muted}>{error || '正在读取本地收藏…'}</Text>
    {error && !ready && <Button title="重新读取" onPress={retry} />}
  </View>;
}

export function PostCard({ post }: { post: Post }) {
  const { favorites, toggle, ready, saving } = useFavorites();
  const saved = favorites.some(item => item.id === post.id);
  return <View style={styles.card}>
    <Text style={styles.eyebrow}>文章 {String(post.id).padStart(2, '0')} · 作者 {post.userId}</Text>
    <Link href={{ pathname: '/posts/[id]', params: { id: String(post.id) } }} asChild>
      <Pressable accessibilityRole="link" style={styles.articleLink}>
        <Text style={styles.cardTitle}>{post.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{post.body}</Text>
        <Text style={styles.link}>阅读文章 →</Text>
      </Pressable>
    </Link>
    <Button title={saved ? '★ 已收藏 · 点击取消' : '☆ 收藏文章'} disabled={!ready || saving} onPress={() => void toggle(post)} />
  </View>;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f6fb' },
  content: { padding: 20, gap: 16, paddingBottom: 40, width: '100%', maxWidth: 760, alignSelf: 'center' },
  hero: { padding: 24, borderRadius: 20, backgroundColor: '#112a46', gap: 12 },
  heroTitle: { color: '#ffffff', fontSize: 30, fontWeight: '800' },
  heroText: { color: '#c6d9ed', fontSize: 14, lineHeight: 23 },
  eyebrow: { color: '#59738e', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  card: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: '#e1e8f0' },
  articleLink: { gap: 12 },
  cardTitle: { color: '#142d48', fontSize: 20, lineHeight: 28, fontWeight: '700' },
  title: { color: '#142d48', fontSize: 26, lineHeight: 36, fontWeight: '800' },
  body: { color: '#455a70', fontSize: 16, lineHeight: 27 },
  muted: { color: '#59738e', lineHeight: 23 },
  link: { color: '#1760a5', fontWeight: '600', paddingVertical: 8 },
  button: { backgroundColor: '#e8f0fa', borderRadius: 10, paddingHorizontal: 16, minHeight: 46, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#17568f', fontWeight: '700', fontSize: 14 },
  error: { color: '#b42318', lineHeight: 22 },
  notice: { gap: 10, paddingVertical: 8 },
});
