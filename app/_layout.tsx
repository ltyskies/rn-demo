import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FavoritesProvider } from '../src/storage/FavoritesProvider';

export default function RootLayout() {
  return <FavoritesProvider>
    <StatusBar style="dark" />
    <Stack screenOptions={{ headerTintColor: '#142d48', headerShadowVisible: false, contentStyle: { backgroundColor: '#f3f6fb' } }}>
      <Stack.Screen name="index" options={{ title: '阅读练习室' }} />
      <Stack.Screen name="posts/[id]" options={{ title: '文章详情' }} />
      <Stack.Screen name="favorites" options={{ title: '我的收藏' }} />
      <Stack.Screen name="todos" options={{ title: '我的待办' }} />
    </Stack>
  </FavoritesProvider>;
}
