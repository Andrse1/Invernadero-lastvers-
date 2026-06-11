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
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Nebulizador() {
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const { baseOptions } = useChartColors();

  const historico = trpc.nebulizador.humedadHistorico.useQuery({ limit: 50 }, {
    refetchInterval: pollingEnabled ? 5000 : false,
  });
  const tabla = trpc.nebulizador.humedadTabla.useQuery(undefined, {
    refetchInterval: pollingEnabled ? 10000 : false,
  });
  const ultimo = trpc.nebulizador.humedadUltimo.useQuery(undefined, {
    refetchInterval: pollingEnabled ? 5000 : false,
  });

  const humRango = trpc.nebulizador.humedadRango.useMutation();

  const chartData = useMemo(() => {
    const data = [...(historico.data || [])].reverse();
    return {
      labels: data.map((d) => {
        const date = d.fechaLectura instanceof Date ? d.fechaLectura : new Date(d.fechaLectura);
        return format(date, "HH:mm", { locale: es });
      }),
      datasets: [{
        label: "Humedad (%)",
        data: data.map((d) => d.humedad),
        borderColor: "rgba(6, 182, 212, 1)",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: "rgba(6, 182, 212, 1)",
        fill: true,
        tension: 0.4,
      }],
    };
  }, [historico.data]);

  const chartOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      title: { display: true, text: "Historico de Humedad - Sistema de Nebulizacion" },
    },
    scales: {
      ...baseOptions.scales,
      x: { ...baseOptions.scales.x, ticks: { ...baseOptions.scales.x.ticks, maxTicksLimit: 12 } },
      y: { ...baseOptions.scales.y, min: 0, max: 100 },
    },
  };

  const currentValue = ultimo.data?.[0]?.humedad ?? 0;

  const handleExport = async (_variable: string, desde: string, hasta: string) => {
    const desdeISO = desde ? new Date(desde + "T00:00:00").toISOString() : undefined;
    const hastaISO = hasta ? new Date(hasta + "T23:59:59").toISOString() : undefined;
    return await humRango.mutateAsync({ desde: desdeISO, hasta: hastaISO });
  };

  const dateFormat = (v: unknown) =>
    v instanceof Date ? format(v, "dd/MM/yyyy HH:mm:ss", { locale: es }) : String(v);

  return (
    <Layout title="Nebulizador" subtitle="Control de humedad">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-500" />
            <span className="text-xs uppercase tracking-wider text-[var(--mu)]">Actualizacion automatica</span>
          </div>
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1">
            <span className="text-xs font-bold text-cyan-500">Humedad actual: {currentValue.toFixed(1)}%</span>
          </div>
        </div>
        <button onClick={() => setPollingEnabled(!pollingEnabled)}
          className="rounded-md border border-[var(--bd2)] bg-[var(--s2)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] transition-all hover:bg-[var(--s3)]">
          {pollingEnabled ? "Pausar" : "Reanudar"}
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
        <div className="h-96">
          {historico.data && historico.data.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--mu)]">Sin datos de humedad</div>
          )}
        </div>
      </div>

      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--mu)]">Tabla Historica (ultimos 50 registros)</h2>
      <div className="mb-6">
        <HistoricTable
          title="Humedad - Nebulizador"
          data={(tabla.data || []) as Record<string, unknown>[]}
          loading={tabla.isLoading}
          columns={[
            { key: "fechaLectura", label: "Fecha/Hora", format: dateFormat },
            { key: "humedad", label: "Humedad (%)", format: (v) => Number(v).toFixed(1) },
          ]}
        />
      </div>

      <CsvExport variables={[{ key: "humedad", label: "Humedad" }]} onExport={handleExport} />
    </Layout>
  );
}
