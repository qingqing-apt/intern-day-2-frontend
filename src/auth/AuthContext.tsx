import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/client";
import type { User } from "../types";

type AuthStatus = "loading" | "authed" | "anon";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setStatus("anon");
  }, []);

  // 挂载后若有本地令牌，重新向后端校验（刷新页面行为：不信前端标志）
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("anon");
      return;
    }
    api<User>("/auth/me")
      .then((me) => {
        setUser(me);
        setStatus("authed");
      })
      .catch(() => clearSession());
  }, [clearSession]);

  // 任意接口返回 401 时统一清理
  useEffect(() => {
    const onUnauthorized = () => clearSession();
    window.addEventListener("unauthorized", onUnauthorized);
    return () => window.removeEventListener("unauthorized", onUnauthorized);
  }, [clearSession]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await api<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem("token", result.token);
    const me = await api<User>("/auth/me");
    setUser(me);
    setStatus("authed");
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ status, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 AuthProvider 内使用");
  }
  return ctx;
}
