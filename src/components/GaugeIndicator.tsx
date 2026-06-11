interface Threshold {
  label: string;
  max: number;
  color: string;
  bgClass: string;
}

interface GaugeIndicatorProps {
  value: number;
  unit: string;
  label: string;
  min: number;
  max: number;
  thresholds: Threshold[];
  scaleLabels?: string[];
}

export default function GaugeIndicator({
  value,
  unit,
  label,
  min,
  max,
  thresholds,
  scaleLabels,
}: GaugeIndicatorProps) {
  // Clamp value
  const clampedValue = Math.max(min, Math.min(max, value));

  // Calculate percentage for the bar fill
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  // Determine current status based on thresholds
  const getStatus = () => {
    for (const t of thresholds) {
      if (clampedValue <= t.max) {
        return t;
      }
    }
    // If above all thresholds, use the last one
    return thresholds[thresholds.length - 1];
  };

  const status = getStatus();

  // Build gradient string from thresholds
  const buildGradient = () => {
    const stops: string[] = [];
    thresholds.forEach((t, i) => {
      const pos = ((Math.min(t.max, max) - min) / (max - min)) * 100;
      stops.push(`${t.color} ${pos}%`);
      if (i < thresholds.length - 1) {
        const nextPos = ((Math.min(thresholds[i + 1].max, max) - min) / (max - min)) * 100;
        stops.push(`${thresholds[i + 1].color} ${nextPos}%`);
      }
    });
    return `linear-gradient(to right, ${stops.join(", ")})`;
  };

  // Default scale labels if not provided
  const labels = scaleLabels || thresholds.map((t) => `${t.max} ${unit}`);

  return (
    <div className="w-full">
      {/* Title */}
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--mu)]">
        {label}
      </p>

      {/* Value + Status Badge */}
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-sans text-5xl font-black text-[var(--tx)]">
          {value.toFixed(1)}
        </span>
        <span className="text-sm font-medium text-[var(--mu)]">{unit}</span>
        <span
          className="rounded-full px-3 py-1 text-xs font-bold"
          style={{
            backgroundColor: status.color + "20",
            color: status.color,
            border: `1px solid ${status.color}40`,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Gradient Bar */}
      <div className="relative mb-2 h-6 w-full overflow-hidden rounded-full">
        {/* Background track */}
        <div className="absolute inset-0 rounded-full bg-[var(--s3)]" />
        {/* Colored fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(percentage, 100)}%`,
            background: buildGradient(),
          }}
        />
      </div>

      {/* Scale Labels */}
      <div className="mb-4 flex justify-between">
        {labels.map((l, i) => (
          <span key={i} className="text-[10px] text-[var(--mu)]">
            {l}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {thresholds.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            <span className="text-[10px] text-[var(--mu)]">
              {t.label} {i === 0 ? `(<${t.max})` : i === thresholds.length - 1 ? `(>${thresholds[i - 1].max})` : `(${thresholds[i - 1].max}–${t.max})`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
