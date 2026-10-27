const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  // 只有携带了令牌的请求，401 才代表"凭证失效"；
  // 登录接口本身返回 401 代表"账号或密码错误"，应透传后端提示。
  const token = localStorage.getItem("token");

  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    // 网络层失败（服务未启动、断网、跨域被拦截等）
    throw new ApiError(0, "无法连接后端服务，请检查服务是否已启动");
  }

  if (response.status === 401 && token) {
    // 凭证失效：清理本地状态并通知全局，由路由守卫负责跳转登录页
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("unauthorized"));
    throw new ApiError(401, "登录已失效，请重新登录");
  }

  if (!response.ok) {
    let message = `请求失败（${response.status}）`;
    try {
      const data = await response.json();
      if (typeof data.detail === "string") {
        message = data.detail;
      }
    } catch {
      // 保留默认提示
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
