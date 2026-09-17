// 公共展示组件：列表页与收藏页复用 PostCard，各页面复用 Button 和存储提示。
// type 导入只参与 TypeScript 检查，不会成为运行时依赖。
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Post } from '../api/posts';
import { useFavorites } from '../storage/FavoritesProvider';

export function Button({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  // Pressable 处理点击；disabled 阻止交互，pressed 用于按下时的视觉反馈。
  // 样式数组从左到右合并，后面的 opacity 会覆盖前面的同名属性。
  // accessibilityRole 告诉屏幕阅读器这是按钮，而非普通文本。
  return <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, (disabled || pressed) && { opacity: 0.45 }]}>
    <Text style={styles.buttonText}>{title}</Text>
  </Pressable>;
}

export function StorageNotice() {
  const { ready, error, retry } = useFavorites();
  // 成功读完且没有错误时返回 null，不占用一块额外的提示区域。
  if (!error && ready) return null;
  return <View style={styles.notice}>
    {/* 优先显示错误；没有错误但未 ready 时显示读取进度。 */}
    <Text style={error ? styles.error : styles.muted}>{error || '正在读取本地收藏…'}</Text>
    {/* 只有首次读取失败才重新读取；保存失败时由用户再次点击收藏按钮。 */}
    {error && !ready && <Button title="重新读取" onPress={retry} />}
  </View>;
}

export function PostCard({ post }: { post: Post }) {
  const { favorites, toggle, ready, saving } = useFavorites();
  // 收藏标记来自共享数组，不在卡片里再维护副本，避免多个页面状态不一致。
  const saved = favorites.some(item => item.id === post.id);
  return <View style={styles.card}>
    {/* padStart 只把编号格式化为 01、02，不改变实际路由 ID。 */}
    <Text style={styles.eyebrow}>文章 {String(post.id).padStart(2, '0')} · 作者 {post.userId}</Text>
    {/* pathname 对应文件 src/app/posts/[id].tsx，params 将占位符替换成文章编号。
        asChild 把 Link 的导航能力交给内部 Pressable，让整块正文都可以点击。 */}
    <Link href={{ pathname: '/posts/[id]', params: { id: String(post.id) } }} asChild>
      <Pressable accessibilityRole="link" style={styles.articleLink}>
        <Text style={styles.cardTitle}>{post.title}</Text>
        {/* 列表只展示两行摘要，详情页再展示完整正文。 */}
        <Text style={styles.body} numberOfLines={2}>{post.body}</Text>
        <Text style={styles.link}>阅读文章 →</Text>
      </Pressable>
    </Link>
    {/* 收藏按钮放在导航区域外，点击收藏不会同时进入详情。
        void 忽略 Promise 返回值，保存失败由 Provider 捕获并展示提示。 */}
    <Button title={saved ? '★ 已收藏 · 点击取消' : '☆ 收藏文章'} disabled={!ready || saving} onPress={() => void toggle(post)} />
  </View>;
}

// StyleSheet 集中定义可复用样式；数字尺寸使用 RN 的逻辑单位，无需写 px。
export const styles = StyleSheet.create({
  // flex: 1 填满父容器可用空间；浅色背景作为所有页面底色。
  screen: { flex: 1, backgroundColor: '#f3f6fb' },
  // content 用于滚动区域的内容容器：手机撑满宽度，宽屏最多 760，并水平居中。
  content: { padding: 20, gap: 16, paddingBottom: 40, width: '100%', maxWidth: 760, alignSelf: 'center' },
  // 首页介绍区：深色底、圆角、内部留白，标题和说明使用浅色文字。
  hero: { padding: 24, borderRadius: 20, backgroundColor: '#112a46', gap: 12 },
  heroTitle: { color: '#ffffff', fontSize: 30, fontWeight: '800' },
  heroText: { color: '#c6d9ed', fontSize: 14, lineHeight: 23 },
  // eyebrow 是文章编号/作者的小字；row 横向排列入口，宽度不足时自动换行。
  eyebrow: { color: '#59738e', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12 },
  // 白色卡片用边框与背景分离；articleLink 控制标题、摘要、链接之间的间距。
  card: { backgroundColor: '#ffffff', padding: 20, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: '#e1e8f0' },
  articleLink: { gap: 12 },
  // 文字层级：卡片标题、页面大标题、正文、次要说明、可点击链接。
  cardTitle: { color: '#142d48', fontSize: 20, lineHeight: 28, fontWeight: '700' },
  title: { color: '#142d48', fontSize: 26, lineHeight: 36, fontWeight: '800' },
  body: { color: '#455a70', fontSize: 16, lineHeight: 27 },
  muted: { color: '#59738e', lineHeight: 23 },
  link: { color: '#1760a5', fontWeight: '600', paddingVertical: 8 },
  // 按钮至少 46 高；主轴/交叉轴居中使文字在按钮中居中。
  button: { backgroundColor: '#e8f0fa', borderRadius: 10, paddingHorizontal: 16, minHeight: 46, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#17568f', fontWeight: '700', fontSize: 14 },
  // 错误文字使用红色；notice 为错误和重试按钮预留垂直间距。
  error: { color: '#b42318', lineHeight: 22 },
  notice: { gap: 10, paddingVertical: 8 },
});
