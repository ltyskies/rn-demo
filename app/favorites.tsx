import { Link } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, PostCard, StorageNotice, styles } from '../src/components/ui';
import { useFavorites } from '../src/storage/FavoritesProvider';
import { useState } from 'react';

export default function FavoritesScreen() {
  const { favorites, ready, saving, clear } = useFavorites();
  const [confirm, setConfirm] = useState(false);
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
    <FlatList data={favorites} keyExtractor={item => String(item.id)} contentContainerStyle={styles.content}
      ListHeaderComponent={<View style={{ gap: 12 }}>
        <Text style={styles.title}>留住喜欢的文字</Text>
        <Text style={styles.muted}>已收藏 {favorites.length} 篇 · 本地保存，重启后仍在；离线也可阅读。</Text>
        <StorageNotice />
        {favorites.length > 0 && <Button disabled={!ready || saving} title={confirm ? '确认清空所有收藏' : '清空收藏'} onPress={() => {
          if (!confirm) setConfirm(true);
          else { void clear(); setConfirm(false); }
        }} />}
        {confirm && <Button title="取消" onPress={() => setConfirm(false)} />}
      </View>}
      ListEmptyComponent={ready ? <View style={styles.card}><Text style={styles.body}>还没有收藏，去选一篇喜欢的文章吧。</Text><Link href="/" style={styles.link}>浏览文章 →</Link></View> : null}
      renderItem={({ item }) => <PostCard post={item} />} />
  </SafeAreaView>;
}
