// 保留自定义入口，由 Expo Router 注册应用。
// package.json 的 main 指向本文件。这个副作用导入会启动 Router，加载 src/app/_layout.tsx。
// 不再手动 registerRootComponent(App)，否则会绕开基于 src/app 目录的路由入口。
// 如果以后加入必须提前执行的初始化逻辑，应放在这条导入之前。
import 'expo-router/entry';
