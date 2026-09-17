// 保留原来的待办练习，作为独立页面接入 Router。
// 此文件对应 /todos；重新导出 App 的默认组件即可，无需复制原页面代码。
// App.tsx 此时只是普通组件，应用的真正启动入口是 src/index.ts。
export { default } from '../App';
