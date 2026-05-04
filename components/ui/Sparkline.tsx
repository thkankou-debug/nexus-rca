import { useId } from "react";
import { cn } from "@/lib/utils";

type SparklineProps = {
  data: number[];
  className?: string;
  width?: number;
  height?: number;
  /** CSS color — défaut: currentColor (héritera du text-* parent) */
  color?: string;
  showArea?: boolean;
  showDot?: boolean;
  strokeWidth?: number;
};

/**
 * Sparkline minimaliste en SVG pur — pas de dépendance.
 * Rend une polyline lissée avec aire dégradée et un point final.
 * Hérite de la couleur via `currentColor`.
 */
export function Sparkline({
  data,
  className,
  width = 100,
  height = 28,
  color = "currentColor",
  showArea = true,
  showDot = true,
  strokeWidth = 1.75,
}: SparklineProps) {
  const id = useId();

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  // Padding vertical pour que le stroke ne soit pas coupé
  const pad = strokeWidth;
  const innerH = height - pad * 2;

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = pad + (1 - (v - min) / range) * innerH;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${linePath} L${width.toFixed(2)},${height} L0,${height} Z`;
  const [lx, ly] = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      className={cn("overflow-visible", className)}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {showArea && <path d={areaPath} fill={`url(#${id})`} />}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDot && (
        <circle
          cx={lx}
          cy={ly}
          r={strokeWidth + 0.75}
          fill={color}
          stroke="rgb(var(--surface-elevated))"
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
}
