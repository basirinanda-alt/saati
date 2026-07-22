export interface RadarAxis {
  key: string;
  label: string;
  /** Normalized 0-100 score — see docs/05-assessment-engine.md §9.4. */
  percentageScore: number;
  /**
   * "validated" axes get a solid marker; "insight" axes (added in a later
   * milestone) get a hollow/outline marker. This is a shape distinction,
   * not just a color one, so it survives grayscale printing and colorblind
   * vision — see docs/07-ui-ux.md.
   */
  type: "validated" | "insight";
}

interface RadarChartProps {
  axes: RadarAxis[];
}

const SIZE = 460;
const CENTER = SIZE / 2;
const RADIUS = 140;
const GRID_RINGS = [0.25, 0.5, 0.75, 1];

function pointFor(index: number, total: number, fraction: number) {
  // Start at the top (12 o'clock) and go clockwise.
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: CENTER + RADIUS * fraction * Math.cos(angle),
    y: CENTER + RADIUS * fraction * Math.sin(angle),
  };
}

function polygonPoints(axes: RadarAxis[]) {
  return axes
    .map((axis, i) => {
      const { x, y } = pointFor(i, axes.length, axis.percentageScore / 100);
      return `${x},${y}`;
    })
    .join(" ");
}

/**
 * A radar/spider chart plotting every axis on one shared 0-100 scale — see
 * docs/05-assessment-engine.md §9.4. Sharing a scale is a rendering
 * convenience only; it never implies the underlying measurements carry
 * equivalent scientific weight, which is why validated vs. insight axes
 * are still visually distinguished by marker shape.
 *
 * Hand-rolled SVG rather than a charting library: at up to 10 axes (1
 * WHO-5 + 5 PERMA + 4 Saati Insights, per V1 scope), the geometry is a
 * handful of trig calls, and a library would add a dependency for
 * something this small — see docs/03-system-architecture.md, "Simplicity
 * Wins."
 */
export function RadarChart({ axes }: RadarChartProps) {
  const hasInsightAxes = axes.some((a) => a.type === "insight");

  return (
    <div>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Wellbeing profile across ${axes.length} dimensions`}
        className="mx-auto w-full max-w-sm overflow-visible"
      >
        {/* Deliberately no <title> child here — a literal <title> tag
            inside inline SVG is misparsed by the browser's raw-HTML
            parser during SSR (it gets treated as RAWTEXT before the
            parser switches into SVG foreign-content mode), which sends
            it to the client empty and causes a real hydration mismatch.
            aria-label on the <svg> itself gives the same accessible name
            without that footgun. */}

        {/* Grid rings — recessive, never competing with the data shape. */}
        {GRID_RINGS.map((fraction) => (
          <polygon
            key={fraction}
            points={axes
              .map((_, i) => {
                const { x, y } = pointFor(i, axes.length, fraction);
                return `${x},${y}`;
              })
              .join(" ")}
            className="fill-none stroke-neutral-200 dark:stroke-neutral-700"
            strokeWidth={1}
          />
        ))}

        {/* Spokes */}
        {axes.map((axis, i) => {
          const { x, y } = pointFor(i, axes.length, 1);
          return (
            <line
              key={axis.key}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              className="stroke-neutral-200 dark:stroke-neutral-700"
              strokeWidth={1}
            />
          );
        })}

        {/* Data shape */}
        <polygon
          points={polygonPoints(axes)}
          className="fill-[#2a78d6]/15 stroke-[#2a78d6] dark:fill-[#3987e5]/20 dark:stroke-[#3987e5]"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Vertex markers: filled circle = validated, hollow = insight. */}
        {axes.map((axis, i) => {
          const { x, y } = pointFor(i, axes.length, axis.percentageScore / 100);
          return (
            <circle
              key={axis.key}
              cx={x}
              cy={y}
              r={5}
              strokeWidth={2}
              className={
                axis.type === "validated"
                  ? "fill-[#2a78d6] stroke-[#2a78d6] dark:fill-[#3987e5] dark:stroke-[#3987e5]"
                  : "fill-white stroke-[#2a78d6] dark:fill-neutral-900 dark:stroke-[#3987e5]"
              }
            />
          );
        })}

        {/* Axis labels */}
        {axes.map((axis, i) => {
          const { x, y } = pointFor(i, axes.length, 1.22);
          const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
          const cos = Math.cos(angle);
          const textAnchor =
            cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
          return (
            <text
              key={axis.key}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              className="fill-neutral-700 text-[11px] dark:fill-neutral-300"
            >
              {axis.label}
            </text>
          );
        })}
      </svg>

      {/* Legend — mandatory whenever the chart renders, per
          docs/05-assessment-engine.md §9.4. */}
      <div className="mx-auto mt-4 flex max-w-sm flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block h-2.5 w-2.5 rounded-full bg-[#2a78d6] dark:bg-[#3987e5]"
          />
          Solid marker = Validated Measure (WHO-5, PERMA)
        </div>
        {hasInsightAxes && (
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-2.5 w-2.5 rounded-full border-2 border-[#2a78d6] bg-white dark:border-[#3987e5] dark:bg-neutral-900"
            />
            Outline marker = Saati Insight (not a validated clinical instrument)
          </div>
        )}
      </div>

      {/* Non-visual equivalent for screen reader users — see
          docs/07-ui-ux.md, "a non-visual data-table equivalent." */}
      <table className="sr-only">
        <caption>Wellbeing profile scores by dimension</caption>
        <thead>
          <tr>
            <th scope="col">Dimension</th>
            <th scope="col">Type</th>
            <th scope="col">Score out of 100</th>
          </tr>
        </thead>
        <tbody>
          {axes.map((axis) => (
            <tr key={axis.key}>
              <td>{axis.label}</td>
              <td>
                {axis.type === "validated"
                  ? "Validated Measure"
                  : "Saati Insight"}
              </td>
              <td>{Math.round(axis.percentageScore)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
