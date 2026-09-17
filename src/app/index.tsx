// src/app/index.tsx 对应根路径 /：负责将接口状态转换成文章列表界面。
import { Link } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getPosts } from '../api/posts';
import { Button, PostCard, StorageNotice, styles } from '../components/ui';
import { useRequest } from '../hooks/useRequest';
import { useFavorites } from '../storage/FavoritesProvider';

export default function HomeScreen() {
  // getPosts 是模块级函数，引用稳定；useRequest 在挂载后自动发起请求。
  const { data, loading, error, reload } = useRequest(getPosts);
  // 收藏数量直接读取共享状态，其他页面操作后这里也会自动更新。
  const { favorites } = useFavorites();
  // 顶部安全区域由 Stack 标题栏处理，这里只保护底部及左右边缘。
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
    {/* FlatList 按可视区域组织列表渲染；尚未获得 data 时使用空数组。
        keyExtractor 使用稳定的文章 ID，帮助 React 识别列表项。
        refreshing 绑定加载状态，onRefresh 把下拉动作连接到请求 Hook。
        contentContainerStyle 设置列表内部内容的间距，而非列表外框。 */}
    <FlatList data={data ?? []} keyExtractor={item => String(item.id)}
      contentContainerStyle={styles.content} refreshing={loading} onRefresh={() => void reload()}
      ListHeaderComponent={<View style={{ gap: 16 }}>
        {/* 介绍与导航放在列表头部，会随文章一起滚动，不额外嵌套 ScrollView。 */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>发现，阅读，收藏。</Text>
          <Text style={styles.heroText}>从真实接口获取文章，把喜欢的内容留在手机里。</Text>
          <Text style={styles.heroText}>JSONPlaceholder · 20 篇示例文章</Text>
        </View>
        <View style={styles.row}>
          {/* Link 声明目标路径；Router 负责原生跳转和 Web 地址变化。 */}
          <Link href="/favorites" style={styles.link}>我的收藏（{favorites.length}） →</Link>
          <Link href="/todos" style={styles.link}>待办练习 →</Link>
        </View>
        <StorageNotice />
        {/* 网络错误与存储错误分别展示；重试期间禁用按钮，避免重复点击。 */}
        {error ? <View style={styles.notice}><Text style={styles.error}>{error}</Text><Button title="重新请求" disabled={loading} onPress={() => void reload()} /></View> : null}
        {/* 首次加载时转圈；后续刷新保留已有文章，交给列表的刷新动画反馈。 */}
        {loading && !data && <ActivityIndicator accessibilityLabel="正在加载文章" color="#1760a5" />}
      </View>}
      // 只有请求结束且没有错误时才显示“暂无文章”，避免与加载/错误提示混淆。
      ListEmptyComponent={!loading && !error ? <Text style={styles.muted}>暂无文章，下拉刷新试试。</Text> : null}
      // renderItem 将每条接口记录交给统一的文章卡片，收藏逻辑由卡片复用。
      renderItem={({ item }) => <PostCard post={item} />} />
  </SafeAreaView>;
}
