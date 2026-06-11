import { useMemo, useState } from "react";
import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import ThermometerGauge from "@/components/ThermometerGauge";
import GaugeIndicator from "@/components/GaugeIndicator";
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
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function Co2() {
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const { baseOptions } = useChartColors();

  const humHistorico = trpc.co2.humedadHistorico.useQuery({ limit: 20 }, {
    refetchInterval: pollingEnabled ? 5000 : false,
  });
  const tempUltimo = trpc.co2.temperaturaUltimo.useQuery(undefined, {
    refetchInterval: pollingEnabled ? 5000 : false,
  });
  const co2Ultimo = trpc.co2.co2Ultimo.useQuery(undefined, {
    refetchInterval: pollingEnabled ? 5000 : false,
  });
  const co2Historico = trpc.co2.co2Historico.useQuery({ limit: 30 }, {
    refetchInterval: pollingEnabled ? 5000 : false,
  });

  const humTabla = trpc.co2.humedadTabla.useQuery(undefined, {
    refetchInterval: pollingEnabled ? 10000 : false,
  });
  const tempTabla = trpc.co2.temperaturaTabla.useQuery(undefined, {
    refetchInterval: pollingEnabled ? 10000 : false,
  });
  const co2Tabla = trpc.co2.co2Tabla.useQuery(undefined, {
    refetchInterval: pollingEnabled ? 10000 : false,
  });

  const humRango = trpc.co2.humedadRango.useMutation();
  const tempRango = trpc.co2.temperaturaRango.useMutation();
  const co2Rango = trpc.co2.co2Rango.useMutation();

  // Humidity bar chart
  const humChartData = useMemo(() => {
    const data = [...(humHistorico.data || [])].reverse();
    return {
      labels: data.map((_d, i) => `#${i + 1}`),
      datasets: [{
        label: "Humedad (%)",
        data: data.map((d) => d.humedad),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
        borderRadius: 4,
      }],
    };
  }, [humHistorico.data]);

  // CO2 line chart
  const co2LineData = useMemo(() => {
    const data = [...(co2Historico.data || [])].reverse();
    return {
      labels: data.map((d) => {
        const date = d.fechaLectura instanceof Date ? d.fechaLectura : new Date(d.fechaLectura);
        return format(date, "HH:mm", { locale: es });
      }),
      datasets: [{
        label: "CO2 (ppm)",
        data: data.map((d) => d.co2Ppm),
        borderColor: "rgba(239, 68, 68, 1)",
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "rgba(239, 68, 68, 1)",
        fill: true,
        tension: 0.3,
      }],
    };
  }, [co2Historico.data]);

  const barOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      title: { display: true, text: "Historico de Humedad (ultimos 20 registros)" },
    },
  };

  const lineOptions = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      title: { display: true, text: "Historico de CO2 (ppm)" },
    },
    scales: {
      ...baseOptions.scales,
      x: { ...baseOptions.scales.x, ticks: { ...baseOptions.scales.x.ticks, maxTicksLimit: 10 } },
    },
  };

  const currentTemp = tempUltimo.data?.[0]?.temperatura ?? 0;
  const currentCo2 = co2Ultimo.data?.[0]?.co2Ppm ?? 0;

  const co2Thresholds = [
    { label: "Bueno", max: 800, color: "#22c55e", bgClass: "bg-green-500" },
    { label: "Moderado", max: 1200, color: "#f59e0b", bgClass: "bg-amber-500" },
    { label: "Alto", max: 2000, color: "#ef4444", bgClass: "bg-red-500" },
  ];

  const handleExport = async (variable: string, desde: string, hasta: string) => {
    const desdeISO = desde ? new Date(desde + "T00:00:00").toISOString() : undefined;
    const hastaISO = hasta ? new Date(hasta + "T23:59:59").toISOString() : undefined;

    if (variable === "todas" || variable === "humedad") {
      return await humRango.mutateAsync({ desde: desdeISO, hasta: hastaISO });
    }
    if (variable === "temperatura") {
      return await tempRango.mutateAsync({ desde: desdeISO, hasta: hastaISO });
    }
    if (variable === "co2") {
      return await co2Rango.mutateAsync({ desde: desdeISO, hasta: hastaISO });
    }
    return [];
  };

  const dateFormat = (v: unknown) =>
    v instanceof Date ? format(v, "dd/MM/yyyy HH:mm:ss", { locale: es }) : String(v);

  return (
    <Layout title="CO2" subtitle="Monitoreo de gases y ambiente">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-xs uppercase tracking-wider text-[var(--mu)]">Actualizacion automatica</span>
        </div>
        <button onClick={() => setPollingEnabled(!pollingEnabled)}
          className="rounded-md border border-[var(--bd2)] bg-[var(--s2)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] transition-all hover:bg-[var(--s3)]">
          {pollingEnabled ? "Pausar" : "Reanudar"}
        </button>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--mu)]">Humedad Ambiental</h3>
          <div className="h-72">
            {humHistorico.data && humHistorico.data.length > 0 ? (
              <Bar data={humChartData} options={barOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--mu)]">Sin datos de humedad</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
          <ThermometerGauge value={currentTemp} min={0} max={50} unit="°C" label="Temperatura" color="#f59e0b" />
        </div>

        <div className="flex items-center rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
          <GaugeIndicator
            value={currentCo2}
            unit="ppm"
            label="Concentracion de CO2"
            min={0}
            max={2000}
            thresholds={co2Thresholds}
            scaleLabels={["0 ppm", "500", "1000", "1500", "2000+ ppm"]}
          />
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
        <div className="h-80">
          {co2Historico.data && co2Historico.data.length > 0 ? (
            <Line data={co2LineData} options={lineOptions} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--mu)]">Sin datos de CO2</div>
          )}
        </div>
      </div>

      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--mu)]">Tablas Historicas (ultimos 50 registros)</h2>
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <HistoricTable title="Humedad" data={(humTabla.data || []) as Record<string, unknown>[]} loading={humTabla.isLoading}
          columns={[{ key: "fechaLectura", label: "Fecha/Hora", format: dateFormat }, { key: "humedad", label: "Humedad (%)", format: (v) => Number(v).toFixed(1) }]} />
        <HistoricTable title="Temperatura" data={(tempTabla.data || []) as Record<string, unknown>[]} loading={tempTabla.isLoading}
          columns={[{ key: "fechaLectura", label: "Fecha/Hora", format: dateFormat }, { key: "temperatura", label: "Temp (°C)", format: (v) => Number(v).toFixed(1) }]} />
        <HistoricTable title="Concentracion CO2" data={(co2Tabla.data || []) as Record<string, unknown>[]} loading={co2Tabla.isLoading}
          columns={[{ key: "fechaLectura", label: "Fecha/Hora", format: dateFormat }, { key: "co2Ppm", label: "CO2 (ppm)", format: (v) => Math.round(Number(v)).toString() }]} />
      </div>

      <CsvExport variables={[{ key: "humedad", label: "Humedad" }, { key: "temperatura", label: "Temperatura" }, { key: "co2", label: "CO2" }]} onExport={handleExport} />
    </Layout>
  );
}
