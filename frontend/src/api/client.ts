import type { ErrorDetail } from './contracts';
export interface RequestOptions { method?: string; body?: unknown }
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
function detail(value: unknown): value is ErrorDetail { return record(value) && typeof value.field === 'string' && typeof value.message === 'string'; }
async function envelope(response: Response): Promise<Record<string, unknown>> {
  const value: unknown = await response.json().catch(() => null);
  return record(value) ? value : {};
}

/**
 * 本站 JSON/表单请求的统一入口：解析后端 Result、转换安全错误，并处理一次 CSRF 刷新重试。
 * 登录凭证是浏览器自动携带的 HttpOnly Cookie；JS 只在内存保存 CSRF，不读取或持久化会话 ID。
 */
export function createHttpClient(message: (code: string) => string) {
  let csrfToken: string | null = null;
  let csrfRevision = 0;
  class ApiError extends Error {
    code: string; status: number; retryAfter: number; details: ErrorDetail[];
    constructor(code: string, status: number, retryAfter?: string | null, details: unknown = []) {
      super(code === 'RATE_LIMITED' ? `操作过于频繁，请在${Math.max(1, Number(retryAfter) || 60)}秒后重试。` : message(code));
      this.name = 'ApiError'; this.code = code; this.status = status; this.retryAfter = Math.max(1, Number(retryAfter) || 60);
      this.details = Array.isArray(details) ? details.filter(detail).slice(0, 20) : [];
    }
  }
  async function refreshCsrf(): Promise<void> {
    const revision = csrfRevision;
    const response = await fetch('/api/auth/csrf', { credentials: 'same-origin', cache: 'no-store' });
    if (!response.ok) throw new Error('暂时无法连接服务，请稍后重试。');
    const result = await envelope(response);
    if (result.code !== 'SUCCESS' || !record(result.data) || typeof result.data.token !== 'string' || !result.data.token) throw new Error('暂时无法连接服务，请稍后重试。');
    if (revision === csrfRevision) csrfToken = result.data.token;
  }
  // T 表示调用方预期的 data 类型，只用于编译检查，不代替服务端校验或运行时的数据验证。
  async function request<T>(path: string, options: RequestOptions = {}, retried = false): Promise<T> {
    if (!path.startsWith('/api/')) throw new Error('接口地址必须属于本站。');
    const method = options.method || 'GET', writes = method !== 'GET';
    if (writes && !csrfToken) await refreshCsrf();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (writes && csrfToken) headers['X-CSRF-Token'] = csrfToken;
    // 上传文件用 FormData，multipart 的 boundary 由浏览器生成，不能手写 Content-Type 覆盖。
    if (options.body !== undefined && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    let response: Response;
    try {
      response = await fetch(path, { method, headers, credentials: 'same-origin', cache: 'no-store',
        body: options.body === undefined ? undefined : options.body instanceof FormData ? options.body : JSON.stringify(options.body) });
    } catch { throw new Error('暂时无法连接服务，请稍后重试。'); }
    const result = await envelope(response);
    if (!response.ok || result.code !== 'SUCCESS') {
      // 只有 CSRF 过滤器明确拒绝才重试一次；网络超时可能已经执行成功，自动重发可能重复操作或计费。
      if (response.status === 403 && result.code === 'CSRF_INVALID' && !retried) { await refreshCsrf(); return request<T>(path, options, true); }
      throw new ApiError(typeof result.code === 'string' ? result.code : 'INTERNAL_ERROR', response.status, response.headers.get('Retry-After'), result.details);
    }
    return result.data as T;
  }
  return { request, refreshCsrf, ApiError, setCsrfToken(value: string) { csrfRevision++; csrfToken = value; } };
}
