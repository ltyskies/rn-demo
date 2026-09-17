# AsyncStorage + Expo Router + fetch 实践

基于现有 Expo SDK 57 项目，保留原待办练习，新增文章阅读与本地收藏。

所有应用源码统一放在 `src` 下，配置文件和静态资源保留在项目根目录：

```text
src/
├─ index.ts       启动入口
├─ App.tsx        原待办组件
├─ app/           Router 页面与布局
├─ api/           接口请求
├─ components/    公共组件
├─ hooks/         自定义 Hook
└─ storage/       本地存储与共享状态
```

Expo Router 自动识别 `src/app`，不需要额外配置路由根目录。

## 启动

```bash
npm install
npm run android
# 或在浏览器中练习
npm run web
```

新增了 Router、screens 等原生依赖，旧的 development build 需要先通过 `npm run android` 重建。后续日常开发运行 `npm start` 即可。iOS 原生构建需要 macOS。若切换入口后出现旧页面，运行 `npx expo start --clear`。

## 按顺序阅读代码

1. `src/index.ts`：加载 `expo-router/entry`，由文件目录生成路由。
2. `src/app/_layout.tsx`：Stack 导航与全局收藏 Provider。
3. `src/app/index.tsx`：请求文章列表、下拉刷新，使用 Link 传递文章 ID。
4. `src/app/posts/[id].tsx`：用 `useLocalSearchParams` 获取动态路径参数，再请求详情。
5. `src/api/posts.ts`：fetch GET、HTTP 状态检查、JSON 数据校验。
6. `src/hooks/useRequest.ts`：加载状态、错误重试、15 秒超时；新请求或离开页面时取消旧请求，避免过期响应覆盖。
7. `src/storage/FavoritesProvider.tsx`：用 `getItem` 恢复收藏，`setItem` + `JSON.stringify` 保存，`removeItem` 清空。先完成读取再开放操作，写入成功后更新共享状态。
8. `src/app/favorites.tsx`：显示本地收藏，取消收藏，二次点击确认清空。

## 路由

源文件已按“这一段做什么、怎么实现、为什么这样写”补充中文注释。
建议先读 `src/index.ts` 和 `src/app/_layout.tsx`，再沿页面中的 import 找到请求、存储与公共组件。

### 三条数据流

1. **获取文章**：首页挂载 → `useRequest` 的 effect → `getPosts` → `fetch` → 检查 HTTP 和 JSON → 更新 `data` → `FlatList` 渲染。
2. **打开详情**：点击 `Link` → `/posts/编号` → `[id].tsx` 读取参数 → `getPost` 获取正文 → 渲染详情。网络数据未就绪时，可以先显示本地收藏。
3. **保存收藏**：点击按钮 → `toggle` 生成新数组 → `JSON.stringify` → `AsyncStorage.setItem` → 成功后更新 Context → 所有订阅收藏的页面同步刷新。下次启动通过 `getItem` 和 `JSON.parse` 恢复。

### 配置文件说明

JSON 不支持注释，因此把配置含义放在这里，避免破坏文件格式：

- `package.json` 的 `main: "src/index.ts"`：指定启动入口；`scripts` 提供开发、原生构建、Web 启动命令；`dependencies` 是应用运行依赖，`devDependencies` 是 TypeScript 等开发工具。
- `app.json` 的 `scheme: "rndemo"`：配置应用 URL scheme，原生配置生效需要重新构建；`plugins: ["expo-router"]`：启用 Router 配置插件；`web.bundler: "metro"`：Web 使用 Metro 打包。
- `app.json` 中 `name/slug/version` 是应用标识信息，`orientation` 固定竖屏，`userInterfaceStyle` 设置浅色界面，`icon` 和各平台图标字段指定资源，`android.package` 是 Android 应用 ID，`ios.supportsTablet` 声明支持平板。
- `tsconfig.json` 继承 `expo/tsconfig.base` 的编译选项，`strict: true` 开启严格类型检查，尽早发现参数、空值和返回类型错误。
- `package-lock.json` 记录实际安装的依赖版本，由 npm 管理，不需要逐项手动编辑。

| 路径 | 页面 |
| --- | --- |
| `/` | 文章列表 |
| `/posts/1` | ID 为 1 的文章详情 |
| `/favorites` | 本地收藏 |
| `/todos` | 原有待办练习（仍为内存数据） |

## 接口与存储

使用无需 API Key 的 [JSONPlaceholder](https://jsonplaceholder.typicode.com/guide/)：

- `GET https://jsonplaceholder.typicode.com/posts?_limit=20`
- `GET https://jsonplaceholder.typicode.com/posts/1`

文章是接口提供的英文占位内容。收藏保存在当前设备或浏览器，不提交到服务端。存储键为 `@rn-demo/favorites:v1`，保存文章完整内容，以便离线阅读收藏。AsyncStorage 是未加密的字符串存储，不适合存放密码等敏感信息。

## 手动体验

1. 打开首页，查看加载状态和 20 篇文章，下拉刷新。
2. 进入详情，收藏文章，再到收藏页确认内容同步。
3. 完全关闭并重新打开应用，确认收藏还在。
4. 断网进入已收藏的文章，确认仍可查看本地正文；未收藏文章显示错误和重试按钮。
5. 恢复网络并点击重试；取消收藏，再尝试清空收藏和取消清空。
6. 在 Web 直接访问 `/posts/9999` 和 `/posts/abc`，检查错误提示。

## 检查命令

```bash
npx tsc --noEmit
npx expo install --check
npx expo export --platform web
npx expo export --platform android
```

配置依据：[Expo v57](https://docs.expo.dev/versions/v57.0.0/)、[Router](https://docs.expo.dev/versions/v57.0.0/sdk/router/)、[AsyncStorage](https://docs.expo.dev/versions/v57.0.0/sdk/async-storage/)。
