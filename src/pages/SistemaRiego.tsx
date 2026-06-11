import { useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import HistoricTable from "@/components/HistoricTable";
import CsvExport from "@/components/CsvExport";
import { useChartColors } from "@/hooks/useChartColors";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const COLORS = {
  tempSuelo: "#f97316",
  tempAmbiente: "#ef4444",
  humAmbiente: "#06b6d4",
  humSuelo: "#3b82f6",
  potasio: "#a855f7",
  fosforo: "#f59e0b",
  nitrogeno: "#22c55e",
};

interface ChartSectionProps {
  title: string;
  color: string;
  data: Array<{ fechaLectura: Date | string; value: number }>;
  unit: string;
  chartType?: "line" | "bar";
}

function ChartSection({ title, color, data, unit, chartType = "line" }: ChartSectionProps) {
  const { baseOptions } = useChartColors();

  const chartData = useMemo(() => {
    const reversed = [...data].reverse();
    return {
      labels: reversed.map((d) => {
        const date = d.fechaLectura instanceof Date ? d.fechaLectura : new Date(d.fechaLectura);
        return format(date, "HH:mm", { locale: es });
      }),
      datasets: [{
        label: `${title} (${unit})`,
        data: reversed.map((d) => d.value),
        borderColor: color,
        backgroundColor: color + "18",
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: chartType === "line",
        tension: 0.4,
        ...(chartType === "bar" ? { borderRadius: 4 } : {}),
      }],
    };
  }, [data, title, unit, color, chartType]);

  return (
    <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--mu)]">{title}</h4>
      <div className="h-56">
        {data.length > 0 ? (
          chartType === "line" ? <Line data={chartData} options={baseOptions} /> : <Bar data={chartData} options={baseOptions} />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--mu)]">Sin datos</div>
        )}
      </div>
    </div>
  );
}

export default function SistemaRiego() {
  const [pollingEnabled, setPollingEnabled] = useState(true);

  const tempSuelo = trpc.riego.tempSueloHistorico.useQuery({ limit: 30 }, { refetchInterval: pollingEnabled ? 5000 : false });
  const tempAmbiente = trpc.riego.tempAmbienteHistorico.useQuery({ limit: 30 }, { refetchInterval: pollingEnabled ? 5000 : false });
  const humAmbiente = trpc.riego.humAmbienteHistorico.useQuery({ limit: 30 }, { refetchInterval: pollingEnabled ? 5000 : false });
  const humSuelo = trpc.riego.humSueloHistorico.useQuery({ limit: 30 }, { refetchInterval: pollingEnabled ? 5000 : false });
  const potasio = trpc.riego.potasioHistorico.useQuery({ limit: 30 }, { refetchInterval: pollingEnabled ? 5000 : false });
  const fosforo = trpc.riego.fosforoHistorico.useQuery({ limit: 30 }, { refetchInterval: pollingEnabled ? 5000 : false });
  const nitrogeno = trpc.riego.nitrogenoHistorico.useQuery({ limit: 30 }, { refetchInterval: pollingEnabled ? 5000 : false });

  const tempSueloTabla = trpc.riego.tempSueloTabla.useQuery(undefined, { refetchInterval: pollingEnabled ? 10000 : false });
  const tempAmbienteTabla = trpc.riego.tempAmbienteTabla.useQuery(undefined, { refetchInterval: pollingEnabled ? 10000 : false });
  const humAmbienteTabla = trpc.riego.humAmbienteTabla.useQuery(undefined, { refetchInterval: pollingEnabled ? 10000 : false });
  const humSueloTabla = trpc.riego.humSueloTabla.useQuery(undefined, { refetchInterval: pollingEnabled ? 10000 : false });
  const potasioTabla = trpc.riego.potasioTabla.useQuery(undefined, { refetchInterval: pollingEnabled ? 10000 : false });
  const fosforoTabla = trpc.riego.fosforoTabla.useQuery(undefined, { refetchInterval: pollingEnabled ? 10000 : false });
  const nitrogenoTabla = trpc.riego.nitrogenoTabla.useQuery(undefined, { refetchInterval: pollingEnabled ? 10000 : false });

  const tempSueloLast = trpc.riego.tempSueloUltimo.useQuery(undefined, { refetchInterval: pollingEnabled ? 5000 : false });
  const tempAmbienteLast = trpc.riego.tempAmbienteUltimo.useQuery(undefined, { refetchInterval: pollingEnabled ? 5000 : false });
  const humAmbienteLast = trpc.riego.humAmbienteUltimo.useQuery(undefined, { refetchInterval: pollingEnabled ? 5000 : false });
  const humSueloLast = trpc.riego.humSueloUltimo.useQuery(undefined, { refetchInterval: pollingEnabled ? 5000 : false });
  const potasioLast = trpc.riego.potasioUltimo.useQuery(undefined, { refetchInterval: pollingEnabled ? 5000 : false });
  const fosforoLast = trpc.riego.fosforoUltimo.useQuery(undefined, { refetchInterval: pollingEnabled ? 5000 : false });
  const nitrogenoLast = trpc.riego.nitrogenoUltimo.useQuery(undefined, { refetchInterval: pollingEnabled ? 5000 : false });

  const tempSueloRangoMut = trpc.riego.tempSueloRango.useMutation();
  const tempAmbienteRangoMut = trpc.riego.tempAmbienteRango.useMutation();
  const humAmbienteRangoMut = trpc.riego.humAmbienteRango.useMutation();
  const humSueloRangoMut = trpc.riego.humSueloRango.useMutation();
  const potasioRangoMut = trpc.riego.potasioRango.useMutation();
  const fosforoRangoMut = trpc.riego.fosforoRango.useMutation();
  const nitrogenoRangoMut = trpc.riego.nitrogenoRango.useMutation();

  const toChartData = (data: Array<Record<string, unknown>> | undefined, valueKey: string) => {
    if (!data) return [];
    return data.map((d) => ({ fechaLectura: d.fechaLectura as Date | string, value: Number(d[valueKey] || 0) }));
  };

  const dateFormat = (v: unknown) =>
    v instanceof Date ? format(v, "dd/MM/yyyy HH:mm:ss", { locale: es }) : String(v);

  const handleExport = async (variable: string, desde: string, hasta: string) => {
    const desdeISO = desde ? new Date(desde + "T00:00:00").toISOString() : undefined;
    const hastaISO = hasta ? new Date(hasta + "T23:59:59").toISOString() : undefined;

    switch (variable) {
      case "tempSuelo": return await tempSueloRangoMut.mutateAsync({ desde: desdeISO, hasta: hastaISO });
      case "tempAmbiente": return await tempAmbienteRangoMut.mutateAsync({ desde: desdeISO, hasta: hastaISO });
      case "humAmbiente": return await humAmbienteRangoMut.mutateAsync({ desde: desdeISO, hasta: hastaISO });
      case "humSuelo": return await humSueloRangoMut.mutateAsync({ desde: desdeISO, hasta: hastaISO });
      case "potasio": return await potasioRangoMut.mutateAsync({ desde: desdeISO, hasta: hastaISO });
      case "fosforo": return await fosforoRangoMut.mutateAsync({ desde: desdeISO, hasta: hastaISO });
      case "nitrogeno": return await nitrogenoRangoMut.mutateAsync({ desde: desdeISO, hasta: hastaISO });
      default: return await tempSueloRangoMut.mutateAsync({ desde: desdeISO, hasta: hastaISO });
    }
  };

  const currentValues = {
    tempSuelo: tempSueloLast.data?.[0]?.temperaturaSuelo ?? 0,
    tempAmbiente: tempAmbienteLast.data?.[0]?.temperaturaAmbiente ?? 0,
    humAmbiente: humAmbienteLast.data?.[0]?.humedadAmbiente ?? 0,
    humSuelo: humSueloLast.data?.[0]?.humedadSuelo ?? 0,
    potasio: potasioLast.data?.[0]?.potasio ?? 0,
    fosforo: fosforoLast.data?.[0]?.fosforo ?? 0,
    nitrogeno: nitrogenoLast.data?.[0]?.nitrogeno ?? 0,
  };

  const valueLabels: Record<string, { label: string; unit: string; color: string }> = {
    tempSuelo: { label: "Temp. Suelo", unit: "°C", color: COLORS.tempSuelo },
    tempAmbiente: { label: "Temp. Amb.", unit: "°C", color: COLORS.tempAmbiente },
    humAmbiente: { label: "Hum. Amb.", unit: "%", color: COLORS.humAmbiente },
    humSuelo: { label: "Hum. Suelo", unit: "%", color: COLORS.humSuelo },
    potasio: { label: "Potasio", unit: "mg/L", color: COLORS.potasio },
    fosforo: { label: "Fosforo", unit: "mg/L", color: COLORS.fosforo },
    nitrogeno: { label: "Nitrogeno", unit: "mg/L", color: COLORS.nitrogeno },
  };

  return (
    <Layout title="Sistema de Riego" subtitle="Gestion de suelo y ambiente">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs uppercase tracking-wider text-[var(--mu)]">Actualizacion automatica</span>
        </div>
        <button onClick={() => setPollingEnabled(!pollingEnabled)}
          className="rounded-md border border-[var(--bd2)] bg-[var(--s2)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] transition-all hover:bg-[var(--s3)]">
          {pollingEnabled ? "Pausar" : "Reanudar"}
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
        {Object.entries(currentValues).map(([key, value]) => {
          const info = valueLabels[key];
          return (
            <div key={key} className="rounded-lg border border-[var(--bd)] bg-[var(--su)] p-2 text-center">
              <p className="text-[8px] font-bold uppercase tracking-wider text-[var(--mu)]">{info.label}</p>
              <p className="font-mono text-lg font-bold" style={{ color: info.color }}>
                {typeof value === "number" ? value.toFixed(1) : value}{info.unit}
              </p>
            </div>
          );
        })}
      </div>

      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--mu)]">Graficos en Tiempo Real</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ChartSection title="Temperatura del Suelo" color={COLORS.tempSuelo} data={toChartData(tempSuelo.data, "temperaturaSuelo")} unit="°C" />
        <ChartSection title="Temperatura Ambiente" color={COLORS.tempAmbiente} data={toChartData(tempAmbiente.data, "temperaturaAmbiente")} unit="°C" />
        <ChartSection title="Humedad Ambiente" color={COLORS.humAmbiente} data={toChartData(humAmbiente.data, "humedadAmbiente")} unit="%" />
        <ChartSection title="Humedad del Suelo" color={COLORS.humSuelo} data={toChartData(humSuelo.data, "humedadSuelo")} unit="%" />
        <ChartSection title="Potasio (K)" color={COLORS.potasio} data={toChartData(potasio.data, "potasio")} unit="mg/L" chartType="bar" />
        <ChartSection title="Fosforo (P)" color={COLORS.fosforo} data={toChartData(fosforo.data, "fosforo")} unit="mg/L" chartType="bar" />
        <ChartSection title="Nitrogeno (N)" color={COLORS.nitrogeno} data={toChartData(nitrogeno.data, "nitrogeno")} unit="mg/L" chartType="bar" />
      </div>

      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--mu)]">Tablas Historicas (ultimos 50 registros)</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <HistoricTable title="Temp. Suelo" data={(tempSueloTabla.data || []) as Record<string, unknown>[]} loading={tempSueloTabla.isLoading}
          columns={[{ key: "fechaLectura", label: "Fecha/Hora", format: dateFormat }, { key: "temperaturaSuelo", label: "Temp (°C)", format: (v) => Number(v).toFixed(1) }]} />
        <HistoricTable title="Temp. Ambiente" data={(tempAmbienteTabla.data || []) as Record<string, unknown>[]} loading={tempAmbienteTabla.isLoading}
          columns={[{ key: "fechaLectura", label: "Fecha/Hora", format: dateFormat }, { key: "temperaturaAmbiente", label: "Temp (°C)", format: (v) => Number(v).toFixed(1) }]} />
        <HistoricTable title="Hum. Ambiente" data={(humAmbienteTabla.data || []) as Record<string, unknown>[]} loading={humAmbienteTabla.isLoading}
          columns={[{ key: "fechaLectura", label: "Fecha/Hora", format: dateFormat }, { key: "humedadAmbiente", label: "Hum (%)", format: (v) => Number(v).toFixed(1) }]} />
        <HistoricTable title="Hum. Suelo" data={(humSueloTabla.data || []) as Record<string, unknown>[]} loading={humSueloTabla.isLoading}
          columns={[{ key: "fechaLectura", label: "Fecha/Hora", format: dateFormat }, { key: "humedadSuelo", label: "Hum (%)", format: (v) => Number(v).toFixed(1) }]} />
        <HistoricTable title="Potasio" data={(potasioTabla.data || []) as Record<string, unknown>[]} loading={potasioTabla.isLoading}
          columns={[{ key: "fechaLectura", label: "Fecha/Hora", format: dateFormat }, { key: "potasio", label: "K (mg/L)", format: (v) => Number(v).toFixed(1) }]} />
        <HistoricTable title="Fosforo" data={(fosforoTabla.data || []) as Record<string, unknown>[]} loading={fosforoTabla.isLoading}
          columns={[{ key: "fechaLectura", label: "Fecha/Hora", format: dateFormat }, { key: "fosforo", label: "P (mg/L)", format: (v) => Number(v).toFixed(1) }]} />
        <HistoricTable title="Nitrogeno" data={(nitrogenoTabla.data || []) as Record<string, unknown>[]} loading={nitrogenoTabla.isLoading}
          columns={[{ key: "fechaLectura", label: "Fecha/Hora", format: dateFormat }, { key: "nitrogeno", label: "N (mg/L)", format: (v) => Number(v).toFixed(1) }]} />
      </div>

      <CsvExport variables={[
        { key: "tempSuelo", label: "Temperatura del Suelo" },
        { key: "tempAmbiente", label: "Temperatura Ambiente" },
        { key: "humAmbiente", label: "Humedad Ambiente" },
        { key: "humSuelo", label: "Humedad del Suelo" },
        { key: "potasio", label: "Potasio" },
        { key: "fosforo", label: "Fosforo" },
        { key: "nitrogeno", label: "Nitrogeno" },
      ]} onExport={handleExport} />
    </Layout>
  );
}
