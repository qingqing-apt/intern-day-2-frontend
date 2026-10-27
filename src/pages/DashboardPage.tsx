import { useCallback, useEffect, useState } from "react";
import { ApiError, api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { LineChart } from "../components/LineChart";
import { StatCard } from "../components/StatCard";
import { formatBytes, formatTime, formatUptime } from "../utils/format";
import type { MetricSample, MetricsSummary } from "../types";

const POLL_MS = 5000;

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [history, setHistory] = useState<MetricSample[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [summaryData, historyData] = await Promise.all([
        api<MetricsSummary>("/metrics/summary"),
        api<MetricSample[]>("/metrics/history?minutes=10"),
      ]);
      setSummary(summaryData);
      setHistory(historyData);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        return; // 已由全局处理，等待跳转登录页
      }
      setError(err instanceof Error ? err.message : "数据加载失败");
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const latest = summary?.latest ?? null;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>服务器监控台</h1>
          <p className="host-info">
            {summary ? `${summary.hostname} · ${summary.platform}` : "正在连接采集服务…"}
          </p>
        </div>
        <div className="header-right">
          <span className="current-user">{user?.username}</span>
          <button className="logout-btn" onClick={() => void logout()}>
            退出登录
          </button>
        </div>
      </header>

      {error && <div className="banner-error">{error}</div>}
      {initialLoading && !latest && <div className="page-loading">正在加载采集数据…</div>}

      {latest && (
        <>
          <section className="stat-grid">
            <StatCard
              title="CPU 使用率"
              value={`${latest.cpu_percent.toFixed(1)}%`}
              series={history.map((s) => s.cpu_percent)}
              color="#4f8ef7"
            />
            <StatCard
              title="内存使用率"
              value={`${latest.mem_percent.toFixed(1)}%`}
              series={history.map((s) => s.mem_percent)}
              color="#9b6ef3"
            />
            <StatCard
              title="磁盘使用率"
              value={`${latest.disk_percent.toFixed(1)}%`}
              series={history.map((s) => s.disk_percent)}
              color="#2fb08c"
            />
            <StatCard
              title="系统运行时长"
              value={formatUptime(latest.uptime_seconds)}
              series={null}
              color="#e8a33d"
            />
          </section>

          <section className="chart-panel">
            <div className="chart-head">
              <h2>CPU / 内存趋势（最近 10 分钟）</h2>
              <span className="chart-meta">
                采样间隔 {summary?.collect_interval_seconds ?? "-"}s · 累计{" "}
                {summary?.total_samples ?? 0} 条
              </span>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <i style={{ background: "#4f8ef7" }} />
                CPU
              </span>
              <span className="legend-item">
                <i style={{ background: "#9b6ef3" }} />
                内存
              </span>
            </div>
            <LineChart
              series={[
                {
                  name: "CPU",
                  color: "#4f8ef7",
                  points: history.map((s) => ({
                    x: new Date(`${s.ts}Z`).getTime(),
                    y: s.cpu_percent,
                  })),
                },
                {
                  name: "内存",
                  color: "#9b6ef3",
                  points: history.map((s) => ({
                    x: new Date(`${s.ts}Z`).getTime(),
                    y: s.mem_percent,
                  })),
                },
              ]}
              yMax={100}
              yUnit="%"
            />
          </section>

          <section className="net-panel">
            <div>
              <span className="net-label">网络接收</span>
              <span className="net-value">{formatBytes(latest.net_rx_bytes)}</span>
            </div>
            <div>
              <span className="net-label">网络发送</span>
              <span className="net-value">{formatBytes(latest.net_tx_bytes)}</span>
            </div>
            <div>
              <span className="net-label">最近更新</span>
              <span className="net-value">{formatTime(latest.ts)}</span>
            </div>
          </section>
        </>
      )}

      {!initialLoading && !latest && !error && (
        <div className="empty-state">暂无采集数据，稍候自动刷新</div>
      )}
    </div>
  );
}
