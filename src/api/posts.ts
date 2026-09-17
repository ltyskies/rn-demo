/**
 * 接口层：只负责“发请求并返回经过校验的数据”，不操作页面状态。
 * 调用关系：页面 -> useRequest -> getPosts/getPost -> request -> fetch。
 * Post 是编译时类型，运行时收到的 JSON 仍要用 isPost 检查。
 */
export type Post = { id: number; userId: number; title: string; body: string };

// 类型守卫：返回 true 后，TypeScript 能把 unknown 缩小为 Post。
// id 是文章编号，userId 是作者编号，title/body 分别是标题和正文。
export function isPost(value: unknown): value is Post {
  // null 的 typeof 也是 object，因此必须先排除空值。
  if (!value || typeof value !== 'object') return false;
  // Partial 表示字段可能不存在；as 只是方便访问字段，不代表校验通过。
  const post = value as Partial<Post>;
  return Number.isInteger(post.id) && Number.isInteger(post.userId)
    && typeof post.title === 'string' && typeof post.body === 'string';
}

export const API_URL = 'https://jsonplaceholder.typicode.com';

// fetch 不会因 404/500 自动抛错，需要检查 response.ok。
// signal 由调用方传入：同一个取消信号会一直传到 fetch，控制底层请求。
// Promise<unknown> 表示异步结果的结构还不可信，交给具体接口函数校验。
async function request(path: string, signal: AbortSignal): Promise<unknown> {
  // 不指定 method 时默认为 GET；await 等待响应，不会阻塞界面线程。
  const response = await fetch(`${API_URL}${path}`, { signal });
  if (!response.ok) throw new Error(`请求失败（HTTP ${response.status}）`);
  // 读取响应体并解析 JSON；无效 JSON、网络异常都会作为 Promise 拒绝向上传递。
  return response.json();
}

// 首页接口：_limit 是这个公共 API 支持的查询参数，用于只取前 20 条。
export async function getPosts(signal: AbortSignal): Promise<Post[]> {
  const data = await request('/posts?_limit=20', signal);
  // 先检查数组，再逐项检查。只有全部符合 Post 结构才返回给页面。
  if (!Array.isArray(data) || !data.every(isPost)) throw new Error('接口返回的文章格式不正确');
  return data;
}

export async function getPost(id: string, signal: AbortSignal): Promise<Post> {
  // 路由参数是字符串。正则只接受正整数文本，提前拦截 abc、0 等无效参数。
  if (!/^[1-9]\d*$/.test(id)) throw new Error('文章 ID 无效');
  const data = await request(`/posts/${id}`, signal);
  // 详情返回单个对象，因此复用 isPost 而不是数组校验。
  if (!isPost(data)) throw new Error('接口返回的文章格式不正确');
  return data;
}
