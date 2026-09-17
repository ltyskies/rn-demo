import { Link } from 'expo-router';
import { Text, View } from 'react-native';
import { styles } from '../src/components/ui';

export default function NotFound() {
  return <View style={[styles.screen, styles.content]}>
    <Text style={styles.title}>页面不存在</Text>
    <Link href="/" style={styles.link}>返回文章列表 →</Link>
  </View>;
}
