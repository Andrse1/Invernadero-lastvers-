import { useEffect, useMemo, useState, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import { useTheme } from "@/providers/ThemeProvider";
import { Link } from "react-router";
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
import { useChartColors } from "@/hooks/useChartColors";
import {
  Sprout, ArrowLeft,
  RotateCcw, ChevronRight, Trash2, Pencil, Download, X,
} from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

// ── Constants from html.h ──
const WL = [415, 445, 480, 515, 555, 590, 630, 680];
const CN = ["415nm", "445nm", "480nm", "515nm", "555nm", "590nm", "630nm", "680nm"];
const CC = ["#8B00FF", "#4B0082", "#0000FF", "#00BFFF", "#00AA00", "#FFD700", "#FF8C00", "#FF2200"];
const CNOM = ["Violeta", "Índigo", "Azul", "Cian", "Verde", "Amarillo", "Naranja", "Rojo"];
// Channel short names: Vi, Índ, Az, Cy, Ve, Am, Na, Ro

// ── Alert messages ──
const ALERTAS = ["Sin alertas", "", "Clear=0: obstrucción en sensor", "Clear saturado: luz excesiva"];

// ── Toast notification ──
function useToast() {
  const [toast, setToast] = useState<{ msg: string; color?: string } | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);
  const show = useCallback((msg: string, color?: string) => setToast({ msg, color }), []);
  return { toast, show };
}

// ── Plant data type ──
interface PlantConfig {
  nombre: string;
  dli_ch: number[];
}
interface Planta {
  nombre: string;
  configs: PlantConfig[];
}

// ── Default plants from html.h ──
const defaultPlantas: Planta[] = [
  { nombre: "Lechuga", configs: [
    { nombre: "Vegetativo", dli_ch: [0.60, 1.80, 1.80, 1.20, 0.96, 1.20, 2.64, 1.80] },
    { nombre: "Maduracion", dli_ch: [0.30, 1.00, 1.20, 0.80, 0.70, 1.00, 2.80, 2.20] },
  ]},
  { nombre: "Tomate", configs: [
    { nombre: "Plantula", dli_ch: [0.60, 2.10, 2.10, 1.35, 1.05, 1.35, 3.60, 2.85] },
    { nombre: "Vegetativo", dli_ch: [0.66, 2.64, 2.86, 1.76, 1.54, 2.20, 5.72, 4.62] },
    { nombre: "Floracion", dli_ch: [0.84, 2.80, 3.08, 1.96, 1.68, 2.80, 8.40, 6.44] },
  ]},
  { nombre: "Albahaca", configs: [
    { nombre: "Crecimiento", dli_ch: [0.52, 1.69, 1.82, 1.17, 1.04, 1.30, 3.12, 2.34] },
    { nombre: "Produccion", dli_ch: [0.33, 1.21, 1.32, 0.88, 0.77, 1.10, 2.97, 2.42] },
  ]},
];

// ── Format ms to HH:MM:SS ──
function fmtMs(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Parse decimal with comma support ──
function parseDec(s: string) {
  return parseFloat(String(s).trim().replace(",", ".")) || 0;
}

// ═══════════════════════════════════════════════════════════════
// ILUMINACION PAGE - PhytoSense-style with all 4 sub-tabs
// ═══════════════════════════════════════════════════════════════
export default function Iluminacion() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"monitor" | "espectro" | "plantas" | "historial">("monitor");
  const { toast, show } = useToast();

  // ── Real-time data polling ──
  const [polling] = useState(true);
  const dliUltimo = trpc.iluminacion.dliUltimo.useQuery(undefined, { refetchInterval: polling ? 5000 : false });
  const ppfdUltimo = trpc.iluminacion.ppfdUltimo.useQuery(undefined, { refetchInterval: polling ? 5000 : false });
  const espectroUltimo = trpc.iluminacion.espectroUltimo.useQuery(undefined, { refetchInterval: polling ? 5000 : false });
  const espectroHistorico = trpc.iluminacion.espectroHistorico.useQuery({ limit: 30 }, { refetchInterval: polling ? 5000 : false });

  // ── Current data snapshot ──
  const D = useMemo(() => {
    const es = espectroUltimo.data?.[0];
    const dl = dliUltimo.data?.[0];
    const pp = ppfdUltimo.data?.[0];
    if (!es && !dl && !pp) return null;

    const r = es ? [es.ch0, es.ch1, es.ch2, es.ch3, es.ch4, es.ch5, es.ch6, es.ch7] : Array(8).fill(0);
    const dom = domCh(r);

    return {
      s: true, // sensing
      pl: "Lechuga", // plant name
      cf: "Vegetativo", // config name
      fo: es?.focoEstado === "ON", // foco on
      rm: 3600000, // remaining time ms
      dp: dl ? Math.min(dl.porcentaje, 100) : 0, // DLI percentage
      dt: dl ? dl.dliAcumulado : 0, // DLI accumulated
      do: dl ? dl.dliObjetivo : 25, // DLI objective
      ex: dl ? dl.excedente : 0, // excess
      db: dl ? dl.dliTotal : 0, // DLI total
      pp: pp ? pp.ppfd : 0, // PPFD
      r, // raw counts
      pc: r.map(v => v * 0.8), // simulated PPFD per channel
      dc: dl ? Array(8).fill(dl.dliAcumulado / 8) : Array(8).fill(0), // DLI per channel
      oc: defaultPlantas[0].configs[0].dli_ch, // objectives per channel
      al: 0, // alert
      domN: dom.n, // dominant channel name
      domC: dom.c, // dominant channel color
    };
  }, [dliUltimo.data, ppfdUltimo.data, espectroUltimo.data]);

  // ── Status ──
  const sensing = !!D?.s;

  // ── Tabs ──
  const tabs = [
    { id: "monitor" as const, label: "Monitor" },
    { id: "espectro" as const, label: "Espectro" },
    { id: "plantas" as const, label: "Plantas" },
    { id: "historial" as const, label: "Historial" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tx)] transition-colors duration-300">
      {/* ── Header ── */}
      <header className="border-b border-[var(--bd)] bg-[var(--su)] px-5 py-2.5">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Link to="/" className="mr-2 text-[var(--mu)] hover:text-[var(--tx)]">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Sprout className="h-5 w-5 text-emerald-500" />
          <div className="logo font-serif text-xl font-black tracking-tight">
            Phyto<span className="italic text-emerald-500">Sense</span>
          </div>

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${sensing ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" : "bg-red-500/10 text-red-500 border border-red-500/30"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${sensing ? "animate-pulse bg-emerald-500" : "bg-red-500"}`} />
            {sensing ? "SENSANDO" : "SIN SEÑAL"}
          </span>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-[9px] uppercase tracking-[2px] text-[var(--mu)]">ZONA 1</span>
            <button onClick={toggleTheme} className="flex flex-col items-center gap-0.5">
              <div className={`relative h-6 w-11 rounded-full border border-[var(--bd2)] bg-[var(--s2)] transition-colors`}>
                <div className={`absolute top-1 h-4 w-4 rounded-full bg-emerald-500 transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"}`} />
              </div>
              <span className="text-[8px] uppercase tracking-wider text-[var(--mu)]">{theme === "dark" ? "Oscuro" : "Claro"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Navigation Tabs ── */}
      <nav className="border-b border-[var(--bd)] bg-[var(--su)]">
        <div className="mx-auto flex max-w-6xl gap-0 px-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3 text-[10px] font-bold uppercase tracking-[1.5px] transition-all border-b-[2.5px] -mb-[1.5px] ${
                activeTab === t.id
                  ? "border-emerald-500 text-emerald-500"
                  : "border-transparent text-[var(--mu)] hover:text-[var(--tx)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="mx-auto max-w-6xl px-5 py-5">
        {/* Alert strip */}
        <AlertStrip data={D} />

        {activeTab === "monitor" && <MonitorTab data={D} toast={show} />}
        {activeTab === "espectro" && <EspectroTab data={D} espectroData={espectroHistorico.data} />}
        {activeTab === "plantas" && <PlantasTab toast={show} />}
        {activeTab === "historial" && <HistorialTab toast={show} />}
      </main>

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg border border-[var(--bd2)] bg-[var(--su)] px-4 py-2 text-xs font-medium shadow-lg"
          style={{ color: toast.color || "var(--gr)" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ALERT STRIP
// ═══════════════════════════════════════════════════════════════
function AlertStrip({ data }: { data: any }) {
  const [visible, setVisible] = useState(false);
  const alertIdx = data?.al ?? 0;
  const hasAlert = alertIdx > 0;

  useEffect(() => {
    setVisible(hasAlert);
  }, [hasAlert]);

  if (!visible || alertIdx === 0) return null;

  return (
    <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-xs text-amber-500">
      <span>⚠</span>
      <span className="flex-1">{ALERTAS[alertIdx]}</span>
      <button onClick={() => setVisible(false)} className="text-amber-500/50 hover:text-amber-500">✕</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MONITOR TAB
// ═══════════════════════════════════════════════════════════════
function MonitorTab({ data }: { data: any; toast?: (msg: string, color?: string) => void }) {
  const [selectedPlant, setSelectedPlant] = useState(0);
  const [selectedConfig, setSelectedConfig] = useState(0);
  const [plantas] = useState<Planta[]>(defaultPlantas);

  const d = data;
  const focoOn = d?.fo ?? false;
  const dpct = d ? Math.min(d.dp, 100) : 0;
  const dt = d ? d.dt : 0;
  const doVal = d ? d.do : 0;
  const ex = d ? d.ex : 0;
  const db = d ? d.db : 0;
  const pp = d ? d.pp : 0;
  const rm = d ? d.rm : 0;
  const r = d?.r ?? Array(8).fill(0);
  const dom = domCh(r);
  const al = d?.al ?? 0;

  const currentPlant = plantas[selectedPlant];
  const currentCfg = currentPlant?.configs[selectedConfig];

  return (
    <>
      {/* Row 1: Plant config | DLI Progress | DLI Target + PPFD */}
      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        {/* Plant Config Card */}
        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-[var(--su)] to-blue-500/5 p-4"
          style={{ borderColor: "rgba(21,101,192,.25)" }}>
          <div className="font-serif text-xl font-black text-blue-600">
            {currentPlant?.nombre ?? "—"}
          </div>
          <div className="mb-2 text-xs text-[var(--mu)]">
            {currentCfg?.nombre ?? "—"}
          </div>

          {/* Foco status */}
          <span className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[2px] ${
            focoOn
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
              : "border-[var(--bd)] bg-[var(--s2)] text-[var(--mu)]"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${focoOn ? "animate-pulse bg-emerald-500" : "bg-[var(--mu)]"}`} />
            {focoOn ? "ON" : "OFF"}
          </span>

          {/* Plant/Config selectors */}
          <div className="mt-2 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-[9px] uppercase tracking-wider text-[var(--mu)]">Planta</span>
              <select
                value={selectedPlant}
                onChange={(e) => { setSelectedPlant(Number(e.target.value)); setSelectedConfig(0); }}
                className="flex-1 rounded-md border border-blue-500/20 bg-[var(--s2)] px-2 py-1 text-xs text-[var(--tx)] outline-none"
              >
                {plantas.map((p, i) => <option key={i} value={i}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-[9px] uppercase tracking-wider text-[var(--mu)]">Config</span>
              <select
                value={selectedConfig}
                onChange={(e) => setSelectedConfig(Number(e.target.value))}
                className="flex-1 rounded-md border border-blue-500/20 bg-[var(--s2)] px-2 py-1 text-xs text-[var(--tx)] outline-none"
              >
                {currentPlant?.configs.map((c, i) => (
                  <option key={i} value={i}>{c.nombre} ({c.dli_ch.reduce((a, b) => a + b, 0).toFixed(2)})</option>
                ))}
              </select>
            </div>
            <button className="mt-1 w-fit rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-500/10">
              Aplicar
            </button>
          </div>

          {/* Remaining time */}
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[9px] uppercase tracking-wider text-blue-600">Tiempo restante</span>
            <span className="font-serif text-lg font-black text-blue-600">{fmtMs(rm)}</span>
          </div>

          <button className="mt-2 inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-600 hover:bg-blue-500/10">
            <RotateCcw className="h-3 w-3" /> Reiniciar ciclo
          </button>
        </div>

        {/* DLI Progress */}
        <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
          <div className="mb-1 text-[9px] uppercase tracking-[2px] text-[var(--mu)]">Progreso DLI</div>
          <div className="font-serif text-5xl font-black leading-none text-emerald-500">{dpct.toFixed(2)}%</div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--trk)]">
            <div className={`h-full rounded-full transition-all duration-700 ${dpct >= 100 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-emerald-500 to-emerald-600"}`}
              style={{ width: `${Math.min(dpct, 100)}%` }} />
          </div>
          <div className="mt-3 space-y-1 text-[10px]">
            <p className="text-[var(--mu)]">DLI acumulado: <span className="font-bold text-[var(--tx)]">{dt.toFixed(10)}</span> mol·m⁻²·día⁻¹</p>
            {ex > 1e-12 && <p className="font-bold text-red-500">↑ Excedente: {ex.toFixed(10)} mol·m⁻²·día⁻¹</p>}
          </div>
          <hr className="my-2.5 border-[var(--bd)]" />
          <div className="text-[9px] uppercase tracking-wider text-[var(--mu)]">DLI total</div>
          <div className="font-serif text-2xl font-black text-emerald-400">{db.toFixed(10)}</div>
          <div className="text-[9px] text-[var(--mu)]">mol·m⁻²·día⁻¹</div>
        </div>

        {/* DLI Objective + PPFD */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
            <div className="mb-1 text-[9px] uppercase tracking-[2px] text-[var(--mu)]">DLI objetivo</div>
            <div className="font-serif text-3xl font-black text-blue-600">{doVal === 0 ? "—" : doVal.toFixed(10).replace(/\.?0+$/, "")}</div>
            <div className="text-[9px] text-[var(--mu)]">mol·m⁻²·día⁻¹</div>
          </div>
          <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
            <div className="mb-1 text-[9px] uppercase tracking-[2px] text-[var(--mu)]">PPFD</div>
            <div className="font-serif text-3xl font-black text-emerald-500">{pp.toFixed(4)}</div>
            <div className="text-[10px] text-[var(--mu)]">µmol·m⁻²·s⁻¹</div>
          </div>
        </div>
      </div>

      {/* Row 2: Alerts | Spectrum mini bars */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Alerts */}
        <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
          <div className="mb-2 text-[9px] uppercase tracking-[2px] text-[var(--mu)]">Alertas</div>
          <div className={`text-xs ${al > 0 ? "font-bold text-amber-500" : "text-[var(--mu)]"}`}>
            {ALERTAS[al] || "Sin alertas"}
          </div>
        </div>

        {/* Mini Spectrum Bars */}
        <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
          <div className="mb-2 text-[9px] uppercase tracking-[2px] text-[var(--mu)]">Espectro por cuentas</div>
          <MiniSpectrumBars values={r} />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-wider text-[var(--mu)]">Canal dominante</span>
            <span className="text-sm font-black" style={{ color: dom.c }}>{dom.n}</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Mini Spectrum Bars ──
function MiniSpectrumBars({ values }: { values: number[] }) {
  const mx = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-0.5 pt-4" style={{ height: 60 }}>
      {values.map((v, i) => {
        const h = Math.max((v / mx) * 44, 2);
        const label = v > 1000 ? `${(v / 1000).toFixed(1)}k` : Math.round(v).toString();
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end relative" style={{ height: "100%" }}>
            <span className="absolute -top-3 text-[7px] font-bold text-[var(--mu)]">{v > 0 ? label : ""}</span>
            <div className="w-full rounded-t-sm transition-all duration-400" style={{ height: h, background: CC[i], opacity: v === 0 ? 0.2 : 1, minHeight: 2 }} />
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESPECTRO TAB
// ═══════════════════════════════════════════════════════════════
function EspectroTab({ data }: { data: any; espectroData?: any }) {
  const { baseOptions } = useChartColors();
  const r = data?.r ?? Array(8).fill(0);
  const pc = data?.pc ?? Array(8).fill(0);
  const dc = data?.dc ?? Array(8).fill(0);
  const oc = data?.oc ?? Array(8).fill(0);

  const barsChart = useMemo(() => ({
    labels: CN,
    datasets: [{
      label: "Cuentas",
      data: r,
      backgroundColor: CC.map(c => c + "88"),
      borderColor: CC,
      borderWidth: 1,
      borderRadius: 3,
    }],
  }), [r]);

  const curveChart = useMemo(() => {
    const labels: string[] = [];
    const dataPoints: number[] = [];
    for (let i = 0; i < WL.length; i++) {
      labels.push(CN[i]);
      dataPoints.push(pc[i] || 0);
    }
    return {
      labels,
      datasets: [{
        label: "µmol·m⁻²·s⁻¹",
        data: dataPoints,
        borderColor: "#22c55e",
        backgroundColor: "rgba(34,197,94,0.08)",
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: CC,
        pointBorderColor: "#444",
        pointBorderWidth: 1,
        fill: true,
        tension: 0.4,
      }],
    };
  }, [pc]);

  const barOpts = {
    ...baseOptions,
    plugins: { ...baseOptions.plugins, legend: { display: false }, title: { display: true, text: "Intensidad por canal" } },
  };

  const curveOpts = {
    ...baseOptions,
    plugins: { ...baseOptions.plugins, title: { display: true, text: "Curva fotosintética" } },
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
          <div className="h-72">
            <Bar data={barsChart} options={barOpts} />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
          <div className="h-72">
            <Line data={curveChart} options={curveOpts} />
          </div>
        </div>
      </div>

      {/* Right column: channel detail table */}
      <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4 lg:self-start">
        <div className="mb-3 text-[9px] uppercase tracking-[2px] text-[var(--mu)]">Detalle por canal</div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--bd)]">
              <th className="px-2 py-2 text-left text-[9px] uppercase tracking-wider text-[var(--mu)]">Canal</th>
              <th className="px-2 py-2 text-left text-[9px] uppercase tracking-wider text-[var(--mu)]">Cuentas</th>
              <th className="px-2 py-2 text-left text-[9px] uppercase tracking-wider text-[var(--mu)]">PPFD</th>
              <th className="px-2 py-2 text-left text-[9px] uppercase tracking-wider text-[var(--mu)]">DLI</th>
              <th className="px-2 py-2 text-left text-[9px] uppercase tracking-wider text-[var(--mu)]">Objetivo</th>
            </tr>
          </thead>
          <tbody>
            {WL.map((_wl, i) => (
              <tr key={i} className="border-b border-[var(--bd)]/50 hover:bg-[var(--s2)]">
                <td className="px-2 py-2 font-mono">
                  <span className="mr-1.5 inline-block h-2 w-2 rounded-sm" style={{ background: CC[i] }} />
                  {CN[i]}
                </td>
                <td className="px-2 py-2 font-mono">{(r[i] || 0).toFixed(1)}</td>
                <td className="px-2 py-2 font-mono">{(pc[i] || 0).toFixed(5)}</td>
                <td className="px-2 py-2 font-mono">{(dc[i] || 0).toFixed(8)}</td>
                <td className="px-2 py-2 font-mono" style={{ color: "var(--mu)" }}>{(oc[i] || 0) > 0 ? (oc[i]).toFixed(6) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PLANTAS TAB
// ═══════════════════════════════════════════════════════════════
function PlantasTab({ toast }: { toast: (msg: string, color?: string) => void }) {
  const [plantas, setPlantas] = useState<Planta[]>(() => {
    const saved = localStorage.getItem("phyto_plantas");
    return saved ? JSON.parse(saved) : defaultPlantas;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editPi, setEditPi] = useState(-1);
  const [editCi, setEditCi] = useState(-1);
  const [nomInput, setNomInput] = useState("");
  const [cfgInput, setCfgInput] = useState("");
  const [chInputs, setChInputs] = useState<string[]>(Array(8).fill("0"));

  // Save to localStorage whenever plantas changes
  useEffect(() => {
    localStorage.setItem("phyto_plantas", JSON.stringify(plantas));
  }, [plantas]);

  const totalDLI = useMemo(() => chInputs.reduce((s, v) => s + parseDec(v), 0), [chInputs]);

  const openModal = (pi: number, ci: number) => {
    setEditPi(pi);
    setEditCi(ci);
    if (pi === -1) {
      setNomInput("");
      setCfgInput("");
      setChInputs(Array(8).fill("0"));
    } else if (ci === -1) {
      setNomInput(plantas[pi].nombre);
      setCfgInput("");
      setChInputs(Array(8).fill("0"));
    } else {
      setNomInput(plantas[pi].nombre);
      setCfgInput(plantas[pi].configs[ci].nombre);
      setChInputs(plantas[pi].configs[ci].dli_ch.map(String));
    }
    setModalOpen(true);
  };

  const savePlant = () => {
    const nom = nomInput.trim();
    const cfn = cfgInput.trim();
    const dch = chInputs.map(parseDec);
    if (!nom || !cfn) { toast("⚠ Completa campos", "var(--re)"); return; }

    setPlantas(prev => {
      const next = [...prev];
      if (editPi === -1) {
        next.push({ nombre: nom, configs: [{ nombre: cfn, dli_ch: dch }] });
      } else {
        next[editPi] = { ...next[editPi], nombre: nom };
        if (editCi === -1) {
          next[editPi].configs.push({ nombre: cfn, dli_ch: dch });
        } else {
          next[editPi].configs[editCi] = { nombre: cfn, dli_ch: dch };
        }
      }
      return next;
    });
    setModalOpen(false);
    toast("✓ Guardado");
  };

  const deletePlant = (pi: number) => {
    if (!confirm(`¿Eliminar "${plantas[pi].nombre}"?`)) return;
    setPlantas(prev => prev.filter((_, i) => i !== pi));
    toast("Eliminada", "var(--re)");
  };

  const deleteConfig = (pi: number, ci: number) => {
    if (!confirm(`¿Eliminar "${plantas[pi].configs[ci].nombre}"?`)) return;
    setPlantas(prev => {
      const next = [...prev];
      next[pi] = { ...next[pi], configs: next[pi].configs.filter((_, i) => i !== ci) };
      return next;
    });
    toast("Config eliminada");
  };

  return (
    <>
      <div className="flex flex-wrap gap-4">
        {plantas.map((p, pi) => (
          <div key={pi} className="w-[260px] shrink-0 rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
            <div className="font-serif text-xl font-black text-emerald-500">{p.nombre}</div>
            <div className="mb-2 text-[9px] uppercase tracking-wider text-[var(--mu)]">Configuraciones</div>
            <div className="flex flex-col gap-1">
              {p.configs.map((c, ci) => (
                <div key={ci} className="flex items-center justify-between rounded-md bg-[var(--s3)] border border-[var(--bd)] px-3 py-2 text-[10px] uppercase text-emerald-600">
                  <span className="font-bold">{c.nombre}</span>
                  <span className="mr-2 text-[9px] text-[var(--mu)]">{c.dli_ch.reduce((a, b) => a + b, 0).toFixed(2)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openModal(pi, ci)} className="rounded border border-[var(--bd2)] bg-[var(--su)] px-2 py-0.5 text-[9px] text-[var(--mu)] hover:text-[var(--tx)]">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteConfig(pi, ci)} className="rounded border border-[var(--bd2)] bg-[var(--su)] px-2 py-0.5 text-[9px] text-[var(--mu)] hover:border-red-400 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => openModal(pi, -1)} className="flex-1 rounded-md border border-[var(--bd2)] bg-[var(--s2)] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-500 hover:bg-[var(--s3)]">
                + Config
              </button>
              <button onClick={() => deletePlant(pi)} className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-500/20">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Add new plant button */}
        <button onClick={() => openModal(-1, -1)}
          className="flex h-[160px] w-[260px] items-center justify-center rounded-xl border-2 border-dashed border-[var(--bd2)] bg-transparent text-[10px] font-bold uppercase tracking-wider text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5">
          + Nueva planta
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--bd2)] bg-[var(--su)] p-6">
            <button onClick={() => setModalOpen(false)} className="absolute right-3 top-3 rounded border border-[var(--bd)] bg-[var(--s2)] px-2 py-1 text-xs text-[var(--mu)]">
              <X className="h-3 w-3" />
            </button>
            <div className="mb-4 font-serif text-xl font-black text-emerald-500">
              {editPi === -1 ? "Nueva planta" : editCi === -1 ? "Nueva config" : "Editar config"}
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-[9px] uppercase tracking-wider text-[var(--mu)]">Nombre planta</label>
                <input value={nomInput} onChange={e => setNomInput(e.target.value)}
                  disabled={editPi >= 0 && editCi >= 0}
                  className="w-full rounded-md border border-[var(--bd2)] bg-[var(--s2)] px-3 py-2 text-sm text-[var(--tx)] outline-none disabled:opacity-50"
                  placeholder="Ej: Cannabis" />
              </div>
              <div>
                <label className="mb-1 block text-[9px] uppercase tracking-wider text-[var(--mu)]">Nombre config</label>
                <input value={cfgInput} onChange={e => setCfgInput(e.target.value)}
                  className="w-full rounded-md border border-[var(--bd2)] bg-[var(--s2)] px-3 py-2 text-sm text-[var(--tx)] outline-none"
                  placeholder="Ej: Floración" />
              </div>

              <div>
                <label className="mb-1 block text-[9px] uppercase tracking-wider text-[var(--mu)]">DLI por canal (mol·m⁻²·día⁻¹)</label>
                <p className="mb-2 text-[9px] text-[var(--mu)]">Acepta punto <b>o</b> coma · Canal en 0 = sin objetivo (su luz irá a excedente)</p>
                <div className="grid grid-cols-4 gap-2">
                  {CN.map((nm, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <label className="text-[9px] font-medium" style={{ color: CC[i] }}>{nm}</label>
                      <input value={chInputs[i]} onChange={e => {
                        const next = [...chInputs]; next[i] = e.target.value; setChInputs(next);
                      }}
                        className="rounded-md border border-[var(--bd2)] bg-[var(--s2)] px-2 py-1 text-xs text-[var(--tx)] outline-none"
                        inputMode="decimal" autoComplete="off" />
                    </div>
                  ))}
                </div>
                <div className="mt-2 rounded-md bg-[var(--s3)] px-3 py-2 text-xs text-[var(--mu)]">
                  Total = <strong className="text-emerald-500">{totalDLI.toFixed(10).replace(/\.?0+$/, "")}</strong> mol·m⁻²·día⁻¹
                </div>
              </div>

              <button onClick={savePlant}
                className="mt-1 rounded-lg bg-emerald-500 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-emerald-600">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// HISTORIAL TAB
// ═══════════════════════════════════════════════════════════════
function HistorialTab({ toast }: { toast: (msg: string, color?: string) => void }) {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [soloInter, setSoloInter] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  // Mock cycle data - in production this would come from the API
  const [ciclos] = useState<Array<{ n: string; i: boolean; a: Array<{ n: string; s: number; r: string }> }>>([
    { n: "Phyto_Ciclo_06_01_2026", i: false, a: [
      { n: "espectro.bmp", s: 245760, r: "/ciclos/Phyto_Ciclo_06_01_2026/espectro.bmp" },
      { n: "datos_transf.csv", s: 12288, r: "/ciclos/Phyto_Ciclo_06_01_2026/datos_transf.csv" },
    ]},
    { n: "Phyto_Ciclo_05_01_2026", i: true, a: [
      { n: "espectro.bmp", s: 180224, r: "/ciclos/Phyto_Ciclo_05_01_2026/espectro.bmp" },
    ]},
    { n: "Phyto_Ciclo_04_01_2026", i: false, a: [
      { n: "espectro.bmp", s: 221184, r: "/ciclos/Phyto_Ciclo_04_01_2026/espectro.bmp" },
      { n: "resumen.txt", s: 2048, r: "/ciclos/Phyto_Ciclo_04_01_2026/resumen.txt" },
    ]},
  ]);

  const toggleExpand = (idx: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const filtered = ciclos.filter(c => {
    if (soloInter && !c.i) return false;
    return true;
  });

  return (
    <>
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-wider text-[var(--mu)]">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)}
            className="w-36 rounded-md border border-[var(--bd2)] bg-[var(--s2)] px-3 py-2 text-xs text-[var(--tx)] outline-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase tracking-wider text-[var(--mu)]">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)}
            className="w-36 rounded-md border border-[var(--bd2)] bg-[var(--s2)] px-3 py-2 text-xs text-[var(--tx)] outline-none" />
        </div>
        <button className="rounded-lg bg-emerald-500 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-emerald-600">
          Filtrar
        </button>
        <button onClick={() => { setDesde(""); setHasta(""); }}
          className="rounded-lg border border-[var(--bd2)] bg-[var(--s2)] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[var(--mu)] hover:bg-[var(--s3)]">
          Limpiar
        </button>
        <button className="ml-1 rounded-lg bg-emerald-500 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-emerald-600">
          ↻ Actualizar
        </button>
        <button onClick={() => setSoloInter(!soloInter)}
          className={`rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
            soloInter ? "border-red-400/30 bg-red-500/10 text-red-500" : "border-[var(--bd2)] bg-[var(--s2)] text-[var(--mu)]"
          }`}>
          Solo interrumpidos
        </button>
        <span className="ml-auto text-[9px] uppercase tracking-wider text-[var(--mu)]">{filtered.length} ciclo{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Cycle list */}
      <div className="flex flex-col gap-2.5">
        {filtered.map((ciclo, idx) => (
          <div key={idx} className="overflow-hidden rounded-xl border border-[var(--bd)] bg-[var(--su)]">
            <div className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-[var(--s2)]" onClick={() => toggleExpand(idx)}>
              <span className="flex-1 text-xs font-bold">{ciclo.n}</span>
              {ciclo.i && <span className="rounded bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-500 border border-red-500/20">interrumpido</span>}
              <button onClick={(e) => { e.stopPropagation(); if (confirm(`¿Borrar ${ciclo.n}?`)) toast("🗑 Borrado"); }}
                className="rounded border border-red-400/20 bg-red-500/5 px-2 py-0.5 text-[9px] text-red-500 hover:bg-red-500/10">
                <Trash2 className="h-3 w-3" />
              </button>
              <ChevronRight className={`h-4 w-4 text-[var(--mu)] transition-transform duration-200 ${expanded.has(idx) ? "rotate-90" : ""}`} />
            </div>
            {expanded.has(idx) && (
              <div className="border-t border-[var(--bd)] px-4 pb-3 pt-2">
                {ciclo.a.length === 0 ? (
                  <div className="py-3 text-xs text-[var(--mu)]">Sin archivos aún</div>
                ) : (
                  ciclo.a.map((a, ai) => (
                    <div key={ai} className="flex items-center gap-2 border-b border-[var(--bd)]/50 py-2 last:border-0">
                      <span className="text-sm">{a.n.endsWith(".bmp") ? "🖼" : a.n.includes("transf") ? "📊" : "📄"}</span>
                      <span className="flex-1 text-xs">{a.n}</span>
                      <span className="mr-2 text-[9px] text-[var(--mu)]">{(a.s / 1024).toFixed(1)} KB</span>
                      <button onClick={() => window.open(`/dl?ruta=${encodeURIComponent(a.r)}`, "_blank")}
                        className="rounded border border-[var(--bd2)] bg-emerald-500/5 px-2 py-0.5 text-[9px] text-emerald-600 hover:bg-emerald-500/10">
                        <Download className="h-3 w-3" />
                      </button>
                      <button onClick={() => { if (confirm(`¿Borrar ${a.n}?`)) toast("🗑 Borrado"); }}
                        className="rounded border border-red-400/20 bg-red-500/5 px-2 py-0.5 text-[9px] text-red-500 hover:bg-red-500/10">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="py-8 text-center text-sm text-[var(--mu)]">Sin ciclos en ese rango</div>}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════════════
function domCh(v: number[]) {
  if (!v || !v.length) return { n: "—", c: "var(--gr)" };
  const mx = Math.max(...v);
  if (mx === 0) return { n: "—", c: "var(--gr)" };
  const i = v.indexOf(mx);
  return { n: CNOM[i], c: CC[i] };
}
