interface StatCardProps {
  title: string;
  value: string;
  series: number[] | null;
  color: string;
}

export function StatCard({ title, value, series, color }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-title">{title}</div>
      <div className="stat-value" style={{ color }}>
        {value}
      </div>
      {series && series.length > 1 && (
        <svg viewBox="0 0 120 32" className="sparkline" aria-hidden="true">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={series
              .slice(-40)
              .map(
                (v, i, arr) =>
                  `${(i / (arr.length - 1)) * 120},${30 - (Math.min(v, 100) / 100) * 28}`,
              )
              .join(" ")}
          />
        </svg>
      )}
    </div>
  );
}
