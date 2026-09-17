// _layout 是 Router 的布局约定文件，不是一个可访问的普通页面。
// 它先建立共享状态和导航容器，再渲染当前路径匹配到的页面。
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FavoritesProvider } from '../storage/FavoritesProvider';

export default function RootLayout() {
  return <FavoritesProvider>
    {/* StatusBar 控制系统状态栏文字颜色；这里 dark 表示深色文字。 */}
    <StatusBar style="dark" />
    {/* Stack 提供堆栈导航：进入详情压入新页面，返回时弹出。
        screenOptions 为所有页面设置默认标题栏样式和内容背景。 */}
    <Stack screenOptions={{ headerTintColor: '#142d48', headerShadowVisible: false, contentStyle: { backgroundColor: '#f3f6fb' } }}>
      {/* name 必须对应 src/app 下的文件路径（不含扩展名）；options 只配置页面外观。
          页面注册来自文件系统，不需要在这里手动 import 每一个页面组件。 */}
      <Stack.Screen name="index" options={{ title: '阅读练习室' }} />
      <Stack.Screen name="posts/[id]" options={{ title: '文章详情' }} />
      <Stack.Screen name="favorites" options={{ title: '我的收藏' }} />
      <Stack.Screen name="todos" options={{ title: '我的待办' }} />
    </Stack>
  </FavoritesProvider>;
}
