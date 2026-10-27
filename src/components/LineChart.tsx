interface Point {
  x: number;
  y: number;
}

interface Series {
  name: string;
  color: string;
  points: Point[];
}

interface LineChartProps {
  series: Series[];
  yMax: number;
  yUnit: string;
}

const WIDTH = 680;
const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 28, left: 48 };
const GRID_VALUES = [0, 25, 50, 75, 100];

/** 手写 SVG 折线图：不引第三方图表库，时间序列够用。 */
export function LineChart({ series, yMax, yUnit }: LineChartProps) {
  const allPoints = series.flatMap((s) => s.points);
  if (allPoints.length === 0) {
    return <div className="chart-empty">暂无趋势数据</div>;
  }

  const minX = Math.min(...allPoints.map((p) => p.x));
  const maxX = Math.max(...allPoints.map((p) => p.x));
  const spanX = maxX - minX || 1;

  const toX = (x: number) =>
    PADDING.left + ((x - minX) / spanX) * (WIDTH - PADDING.left - PADDING.right);
  const toY = (y: number) =>
    HEIGHT - PADDING.bottom - (Math.min(y, yMax) / yMax) * (HEIGHT - PADDING.top - PADDING.bottom);

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="line-chart"
      role="img"
      aria-label="指标趋势图"
    >
      {GRID_VALUES.map((value) => (
        <g key={value}>
          <line
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={toY(value)}
            y2={toY(value)}
            className="chart-grid"
          />
          <text
            x={PADDING.left - 8}
            y={toY(value)}
            textAnchor="end"
            dominantBaseline="central"
            className="chart-axis-text"
          >
            {value}
            {yUnit}
          </text>
        </g>
      ))}

      <text x={PADDING.left} y={HEIGHT - 8} className="chart-axis-text">
        {new Date(minX).toLocaleTimeString()}
      </text>
      <text x={WIDTH - PADDING.right} y={HEIGHT - 8} textAnchor="end" className="chart-axis-text">
        {new Date(maxX).toLocaleTimeString()}
      </text>

      {series.map((s) => (
        <polyline
          key={s.name}
          fill="none"
          stroke={s.color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={s.points.map((p) => `${toX(p.x)},${toY(p.y)}`).join(" ")}
        />
      ))}
    </svg>
  );
}
