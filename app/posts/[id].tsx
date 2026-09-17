import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPost } from '../../src/api/posts';
import { Button, StorageNotice, styles } from '../../src/components/ui';
import { useRequest } from '../../src/hooks/useRequest';
import { useFavorites } from '../../src/storage/FavoritesProvider';

export default function PostScreen() {
  // 动态路由 /posts/1 -> useLocalSearchParams 获取 id，再请求详情。
  const { id } = useLocalSearchParams<{ id: string }>();
  const loader = useCallback((signal: AbortSignal) => getPost(typeof id === 'string' ? id : '', signal), [id]);
  const { data, loading, error, reload } = useRequest(loader);
  const { favorites, ready, saving, toggle } = useFavorites();
  const cached = favorites.find(post => String(post.id) === id);
  const post = data ?? cached;
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
    <Stack.Screen options={{ title: post ? `文章 #${post.id}` : '文章详情' }} />
    <ScrollView contentContainerStyle={styles.content}>
      <StorageNotice />
      {loading && <ActivityIndicator accessibilityLabel="正在加载详情" color="#1760a5" />}
      {error ? <View style={styles.notice}>
        <Text style={styles.error}>{error}{cached ? '，当前显示本地收藏。' : ''}</Text>
        <Button title="重新请求" disabled={loading} onPress={() => void reload()} />
      </View> : null}
      {post && <View style={styles.card}>
        <Text style={styles.eyebrow}>JSONPLACEHOLDER · 作者 {post.userId}</Text>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.body}>{post.body}</Text>
        <Button title={cached ? '★ 已收藏 · 点击取消' : '☆ 收藏到本地'} disabled={!ready || saving} onPress={() => void toggle(post)} />
      </View>}
      <Link href="/favorites" style={styles.link}>查看我的收藏 →</Link>
      <Link href="/" style={styles.link}>返回文章列表 →</Link>
    </ScrollView>
  </SafeAreaView>;
}
