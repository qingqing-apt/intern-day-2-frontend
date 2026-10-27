import { FormEvent, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export function LoginPage() {
  const { login, status } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("请输入账号和密码");
      return;
    }

    setSubmitting(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>服务器监控台</h1>
        <p className="login-subtitle">登录后查看实时采集数据</p>

        <label>
          账号
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="请输入账号"
          />
        </label>

        <label>
          密码
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="请输入密码"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" disabled={submitting || status === "loading"}>
          {submitting ? "登录中…" : "登录"}
        </button>
      </form>
    </div>
  );
}
