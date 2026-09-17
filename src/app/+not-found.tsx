import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { styles } from '../components/ui';

export default function NotFound() {
  // 合并通用背景和内容留白，并提供显式首页链接，帮助用户离开无效路径。
  return <View style={[styles.screen, styles.content]}>
    <Text style={styles.title}>页面不存在</Text>
    <Link href="/" style={styles.link}>返回文章列表 →</Link>
  </View>;
}
// Router 的特殊文件：访问无法匹配任何页面的路径时，显示此兜底页面。
// 它处理的是“路由不存在”；文章接口的 404 由详情页的请求错误提示处理。
