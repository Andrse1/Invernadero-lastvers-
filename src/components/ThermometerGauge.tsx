import { useEffect, useRef } from "react";

interface ThermometerGaugeProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  label: string;
  color?: string;
  height?: number;
}

export default function ThermometerGauge({
  value,
  min = 0,
  max = 100,
  unit = "",
  label,
  color = "#10b981",
  height = 200,
}: ThermometerGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const clampedValue = Math.max(min, Math.min(max, value));
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 80;
    canvas.width = w * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const bulbRadius = 18;
    const tubeWidth = 20;
    const tubeX = w / 2;
    const topY = 15;
    const bottomY = height - bulbRadius - 5;
    const tubeHeight = bottomY - topY;

    // Clear
    ctx.clearRect(0, 0, w, height);

    // Background tube
    ctx.fillStyle = "rgba(100,116,139,0.15)";
    ctx.beginPath();
    ctx.roundRect(tubeX - tubeWidth / 2, topY, tubeWidth, tubeHeight, 10);
    ctx.fill();

    // Bulb background
    ctx.fillStyle = "rgba(100,116,139,0.15)";
    ctx.beginPath();
    ctx.arc(tubeX, bottomY + 5, bulbRadius, 0, Math.PI * 2);
    ctx.fill();

    // Fill height based on value
    const fillHeight = (percentage / 100) * tubeHeight;
    const fillY = bottomY - fillHeight;

    // Gradient for fill
    const gradient = ctx.createLinearGradient(0, bottomY, 0, topY);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColor(color, 40));

    // Fill tube
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(tubeX - tubeWidth / 2 + 3, fillY, tubeWidth - 6, bottomY - fillY, 8);
    ctx.fill();

    // Fill bulb
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(tubeX, bottomY + 5, bulbRadius - 3, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect on bulb
    ctx.fillStyle = adjustColor(color, 60);
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(tubeX - 4, bottomY + 1, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Tick marks
    ctx.strokeStyle = "rgba(100,116,139,0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const tickY = bottomY - (i / 5) * tubeHeight;
      ctx.beginPath();
      ctx.moveTo(tubeX + tubeWidth / 2 + 4, tickY);
      ctx.lineTo(tubeX + tubeWidth / 2 + 12, tickY);
      ctx.stroke();

      // Label
      ctx.fillStyle = "rgba(100,116,139,0.6)";
      ctx.font = "9px monospace";
      ctx.textAlign = "left";
      const tickValue = min + (i / 5) * (max - min);
      ctx.fillText(tickValue.toFixed(0), tubeX + tubeWidth / 2 + 15, tickY + 3);
    }
  }, [value, min, max, percentage, color, height]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={canvasRef}
        style={{ width: 80, height }}
        className="mx-auto"
      />
      <div className="text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--mu)]">{label}</p>
        <p className="font-mono text-lg font-bold" style={{ color }}>
          {value.toFixed(1)}
          {unit && <span className="ml-1 text-xs">{unit}</span>}
        </p>
      </div>
    </div>
  );
}

function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
