import { Link } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPosts } from '../src/api/posts';
import { Button, PostCard, StorageNotice, styles } from '../src/components/ui';
import { useRequest } from '../src/hooks/useRequest';
import { useFavorites } from '../src/storage/FavoritesProvider';

export default function HomeScreen() {
  const { data, loading, error, reload } = useRequest(getPosts);
  const { favorites } = useFavorites();
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
    <FlatList data={data ?? []} keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.content} refreshing={loading} onRefresh={() => void reload()}
      ListHeaderComponent={<View style={{ gap: 16 }}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>发现，阅读，收藏。</Text>
          <Text style={styles.heroText}>从真实接口获取文章，把喜欢的内容留在手机里。</Text>
          <Text style={styles.heroText}>JSONPlaceholder · 20 篇示例文章</Text>
        </View>
        <View style={styles.row}>
          <Link href="/favorites" style={styles.link}>我的收藏（{favorites.length}） →</Link>
          <Link href="/todos" style={styles.link}>待办练习 →</Link>
        </View>
        <StorageNotice />
        {error ? <View style={styles.notice}><Text style={styles.error}>{error}</Text><Button title="重新请求" disabled={loading} onPress={() => void reload()} /></View> : null}
        {loading && !data && <ActivityIndicator accessibilityLabel="正在加载文章" color="#1760a5" />}
      </View>}
      ListEmptyComponent={!loading && !error ? <Text style={styles.muted}>暂无文章，下拉刷新试试。</Text> : null}
      renderItem={({ item }) => <PostCard post={item} />} />
  </SafeAreaView>;
}
