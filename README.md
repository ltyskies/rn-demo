# AsyncStorage + Expo Router + fetch 实践

基于现有 Expo SDK 57 项目，保留原待办练习，新增文章阅读与本地收藏。

## 启动

```bash
npm install
npm run android
# 或在浏览器中练习
npm run web
```

新增了 Router、screens 等原生依赖，旧的 development build 需要先通过 `npm run android` 重建。后续日常开发运行 `npm start` 即可。iOS 原生构建需要 macOS。若切换入口后出现旧页面，运行 `npx expo start --clear`。

## 按顺序阅读代码

1. `index.ts`：加载 `expo-router/entry`，由文件目录生成路由。
2. `app/_layout.tsx`：Stack 导航与全局收藏 Provider。
3. `app/index.tsx`：请求文章列表、下拉刷新，使用 Link 传递文章 ID。
4. `app/posts/[id].tsx`：用 `useLocalSearchParams` 获取动态路径参数，再请求详情。
5. `src/api/posts.ts`：fetch GET、HTTP 状态检查、JSON 数据校验。
6. `src/hooks/useRequest.ts`：加载状态、错误重试、15 秒超时；新请求或离开页面时取消旧请求，避免过期响应覆盖。
7. `src/storage/FavoritesProvider.tsx`：用 `getItem` 恢复收藏，`setItem` + `JSON.stringify` 保存，`removeItem` 清空。先完成读取再开放操作，写入成功后更新共享状态。
8. `app/favorites.tsx`：显示本地收藏，取消收藏，二次点击确认清空。

## 路由

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
