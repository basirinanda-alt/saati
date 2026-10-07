interface ScoreGaugeProps {
  /** Normalized 0-100 score. */
  percentageScore: number;
  /** Accessible name, e.g. "WHO-5 Wellbeing Index: 56 out of 100". */
  label: string;
  /** "arc" is a half-circle gauge, "ring" a full circle. */
  shape?: "arc" | "ring";
  /** CSS colour for the filled part — a token, e.g. "var(--r-accent)". */
  color?: string;
  className?: string;
}

/**
 * The headline-score visual on the results page: a single-colour ring or
 * half-circle gauge with the number in the middle. Static on purpose (no
 * fill animation) — the PDF export is a print of this page (lib/pdf/
 * render.ts), and an animation caught mid-way would print a wrong-looking
 * value. The number is always shown as text too, so the arc is never the
 * only carrier of the score.
 *
 * Accessible name goes on the <svg> via aria-label, not a <title> child —
 * see the SSR note in RadarChart.
 */
export function ScoreGauge({
  percentageScore,
  label,
  shape = "ring",
  color = "var(--r-accent)",
  className = "",
}: ScoreGaugeProps) {
  const value = Math.max(0, Math.min(100, percentageScore));
  const rounded = Math.round(value);

  if (shape === "arc") {
    const d = "M14 86 A66 66 0 0 1 146 86";
    return (
      <svg
        viewBox="0 0 160 100"
        role="img"
        aria-label={label}
        className={`w-40 max-w-full ${className}`}
      >
        <path
          d={d}
          fill="none"
          stroke="var(--r-track)"
          strokeWidth={12}
          strokeLinecap="round"
        />
        {value > 0 && (
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${value} 100`}
          />
        )}
        <text
          x={80}
          y={76}
          textAnchor="middle"
          className="fill-(--r-ink) text-[34px] font-semibold tabular-nums"
        >
          {rounded}
        </text>
        <text
          x={80}
          y={95}
          textAnchor="middle"
          className="fill-(--r-soft) text-[10px] font-semibold"
        >
          out of 100
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 132 132"
      role="img"
      aria-label={label}
      className={`h-32 w-32 ${className}`}
    >
      <circle
        cx={66}
        cy={66}
        r={58}
        fill="none"
        stroke="var(--r-track)"
        strokeWidth={11}
      />
      {value > 0 && (
        <circle
          cx={66}
          cy={66}
          r={58}
          fill="none"
          stroke={color}
          strokeWidth={11}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${value} 100`}
          transform="rotate(-90 66 66)"
        />
      )}
      <text
        x={66}
        y={68}
        textAnchor="middle"
        className="fill-(--r-ink) text-[34px] font-semibold tabular-nums"
      >
        {rounded}
      </text>
      <text
        x={66}
        y={88}
        textAnchor="middle"
        className="fill-(--r-soft) text-[10px] font-semibold"
      >
        out of 100
      </text>
    </svg>
  );
}
