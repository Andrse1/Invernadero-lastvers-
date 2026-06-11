import { useTheme } from "@/providers/ThemeProvider";
import { useMemo } from "react";

export function useChartColors() {
  const { theme } = useTheme();

  return useMemo(() => {
    const isDark = theme === "dark";

    const colors = {
      text: isDark ? "#e8f5e9" : "#1a2e1c",
      muted: isDark ? "#6a9a6c" : "#4a6a4c",
      grid: isDark ? "rgba(100,200,110,0.12)" : "rgba(26,46,28,0.12)",
      tooltipBg: isDark ? "#141e1a" : "#ffffff",
      tooltipText: isDark ? "#e8f5e9" : "#1a2e1c",
    };

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: colors.text,
            font: { size: 12, family: "Inter, sans-serif" },
          },
        },
        title: {
          color: colors.text,
          font: { size: 13, family: "Inter, sans-serif", weight: 700 },
        },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.text,
          bodyColor: colors.text,
          borderColor: colors.grid,
          borderWidth: 1,
          titleFont: { size: 12 },
          bodyFont: { size: 11 },
          padding: 10,
        },
      },
      scales: {
        x: {
          ticks: {
            color: colors.muted,
            font: { size: 11, family: "'Courier Prime', monospace" },
          },
          grid: { color: colors.grid },
          border: { color: colors.grid },
        },
        y: {
          ticks: {
            color: colors.muted,
            font: { size: 11, family: "'Courier Prime', monospace" },
          },
          grid: { color: colors.grid },
          border: { color: colors.grid },
        },
      },
    };

    return { colors, baseOptions };
  }, [theme]);
}
