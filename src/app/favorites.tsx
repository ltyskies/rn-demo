// /favorites 只消费本地收藏状态，不请求文章列表，因此离线也能展示完整收藏。
import { Link } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, PostCard, StorageNotice, styles } from '../components/ui';
import { useFavorites } from '../storage/FavoritesProvider';
import { useState } from 'react';

export default function FavoritesScreen() {
  const { favorites, ready, saving, clear } = useFavorites();
  // confirm 是当前页的临时交互状态，不需要持久化；首次点击只进入确认状态。
  const [confirm, setConfirm] = useState(false);
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
    <FlatList data={favorites} keyExtractor={item => String(item.id)} contentContainerStyle={styles.content}
      ListHeaderComponent={<View style={{ gap: 12 }}>
        {/* 数量来自数组长度；StorageNotice 统一显示初始化和保存失败的提示。 */}
        <Text style={styles.title}>留住喜欢的文字</Text>
        <Text style={styles.muted}>已收藏 {favorites.length} 篇 · 本地保存，重启后仍在；离线也可阅读。</Text>
        <StorageNotice />
        {/* 有收藏才显示清空按钮。读取未完成或正在保存时禁用，防止并发写入。 */}
        {favorites.length > 0 && <Button disabled={!ready || saving} title={confirm ? '确认清空所有收藏' : '清空收藏'} onPress={() => {
          // 第一次点击改文案；第二次调用 Provider 删除存储键，并退出确认状态。
          if (!confirm) setConfirm(true);
          else { void clear(); setConfirm(false); }
        }} />}
        {/* 取消只退出确认状态，不修改收藏数组和存储。 */}
        {confirm && <Button title="取消" onPress={() => setConfirm(false)} />}
      </View>}
      // ready 后才显示空状态，否则读取尚未完成时会短暂误报“没有收藏”。
      ListEmptyComponent={ready ? <View style={styles.card}><Text style={styles.body}>还没有收藏，去选一篇喜欢的文章吧。</Text><Link href="/" style={styles.link}>浏览文章 →</Link></View> : null}
      // 复用同一张卡片，因此取消收藏、打开详情与首页的行为一致。
      renderItem={({ item }) => <PostCard post={item} />} />
  </SafeAreaView>;
}
