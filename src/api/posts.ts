export type Post = { id: number; userId: number; title: string; body: string };

export function isPost(value: unknown): value is Post {
  if (!value || typeof value !== 'object') return false;
  const post = value as Partial<Post>;
  return Number.isInteger(post.id) && Number.isInteger(post.userId)
    && typeof post.title === 'string' && typeof post.body === 'string';
}

export const API_URL = 'https://jsonplaceholder.typicode.com';

// fetch 不会因 404/500 自动抛错，需要检查 response.ok。
async function request(path: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(`${API_URL}${path}`, { signal });
  if (!response.ok) throw new Error(`请求失败（HTTP ${response.status}）`);
  return response.json();
}

export async function getPosts(signal: AbortSignal): Promise<Post[]> {
  const data = await request('/posts?_limit=20', signal);
  if (!Array.isArray(data) || !data.every(isPost)) throw new Error('接口返回的文章格式不正确');
  return data;
}

export async function getPost(id: string, signal: AbortSignal): Promise<Post> {
  if (!/^[1-9]\d*$/.test(id)) throw new Error('文章 ID 无效');
  const data = await request(`/posts/${id}`, signal);
  if (!isPost(data)) throw new Error('接口返回的文章格式不正确');
  return data;
}
