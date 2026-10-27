import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") {
    return <div className="page-loading">正在校验登录状态…</div>;
  }
  if (status === "anon") {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
