// [id] 是动态路径片段：/posts/1 和 /posts/2 都使用本文件，参数不同。
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPost } from '../../api/posts';
import { Button, StorageNotice, styles } from '../../components/ui';
import { useRequest } from '../../hooks/useRequest';
import { useFavorites } from '../../storage/FavoritesProvider';

export default function PostScreen() {
  // 动态路由 /posts/1 -> useLocalSearchParams 获取 id，再请求详情。
  const { id } = useLocalSearchParams<{ id: string }>();
  // useCallback 让 loader 只在 id 改变时更换引用，避免每次渲染都触发新请求。
  // 泛型只提供类型提示；typeof 是运行时保护，异常参数最终由 getPost 拒绝。
  const loader = useCallback((signal: AbortSignal) => getPost(typeof id === 'string' ? id : '', signal), [id]);
  const { data, loading, error, reload } = useRequest(loader);
  const { favorites, ready, saving, toggle } = useFavorites();
  // 在本地收藏中寻找同 ID 的完整文章；find 找不到时返回 undefined。
  const cached = favorites.find(post => String(post.id) === id);
  // ?? 仅在左侧为 null/undefined 时使用右侧：优先网络数据，否则用本地收藏。
  // 本地正文可在网络请求期间就显示；此页仍会尝试请求最新数据。
  const post = data ?? cached;
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
    {/* 在页面内部配置当前 Stack 标题，不会创建一个新的导航器。 */}
    <Stack.Screen options={{ title: post ? `文章 #${post.id}` : '文章详情' }} />
    {/* 详情只有一篇正文，使用 ScrollView 容纳长内容，无需 FlatList。 */}
    <ScrollView contentContainerStyle={styles.content}>
      <StorageNotice />
      {loading && <ActivityIndicator accessibilityLabel="正在加载详情" color="#1760a5" />}
      {/* 请求失败仍保留可用正文；重试只重新发起网络请求，不删除本地收藏。 */}
      {error ? <View style={styles.notice}>
        <Text style={styles.error}>{error}{cached ? '，当前显示本地收藏。' : ''}</Text>
        <Button title="重新请求" disabled={loading} onPress={() => void reload()} />
      </View> : null}
      {/* 有网络结果或本地副本才渲染正文，避免读取 undefined 的属性。 */}
      {post && <View style={styles.card}>
        <Text style={styles.eyebrow}>JSONPLACEHOLDER · 作者 {post.userId}</Text>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.body}>{post.body}</Text>
        {/* cached 是否存在也代表是否已收藏；按钮点击交给共享 Provider 处理。 */}
        <Button title={cached ? '★ 已收藏 · 点击取消' : '☆ 收藏到本地'} disabled={!ready || saving} onPress={() => void toggle(post)} />
      </View>}
      {/* 显式路径导航也适用于直接从浏览器地址打开详情、没有上一页的情况。 */}
      <Link href="/favorites" style={styles.link}>查看我的收藏 →</Link>
      <Link href="/" style={styles.link}>返回文章列表 →</Link>
    </ScrollView>
  </SafeAreaView>;
}
