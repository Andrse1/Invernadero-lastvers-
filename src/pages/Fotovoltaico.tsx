import { trpc } from "@/providers/trpc";
import Layout from "@/components/Layout";
import { Zap, Construction, Clock, Sun, Battery, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function Fotovoltaico() {
  const status = trpc.fotovoltaico.status.useQuery();

  const upcomingFeatures = [
    { icon: Sun, label: "Monitoreo de paneles solares", desc: "Seguimiento de produccion por panel" },
    { icon: Zap, label: "Eficiencia energetica", desc: "Analisis de rendimiento energetico" },
    { icon: Battery, label: "Produccion en tiempo real", desc: "Watts generados instantaneamente" },
    { icon: TrendingUp, label: "Historial de generacion", desc: "Registro diario, semanal y mensual" },
  ];

  return (
    <Layout title="Sistema Fotovoltaico" subtitle="Modulo en desarrollo">
      <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/5 px-6 py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-500/30 bg-amber-500/10">
          <Construction className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">En Construccion</h2>
        <p className="max-w-md text-sm text-[var(--mu)]">
          Este modulo esta siendo desarrollado. Proximamente podras monitorear
          tu sistema de energia solar en tiempo real.
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-amber-500">
          <Clock className="h-3 w-3" />
          <span className="font-semibold uppercase tracking-wider">Fecha estimada: Proximamente</span>
        </div>
      </div>

      {status.data && (
        <div className="mb-8 rounded-xl border border-[var(--bd)] bg-[var(--su)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Estado del Proyecto</h3>
          </div>
          <p className="mb-3 text-sm text-[var(--mu)]">{status.data.mensaje}</p>
          <div className="space-y-2">
            {status.data.proximamente.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[var(--tx)]">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--mu)]">
        Caracteristicas Proximas
      </h3>
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {upcomingFeatures.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div key={i} className="flex items-start gap-4 rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4 opacity-60 transition-opacity hover:opacity-100">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                <Icon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold">{feature.label}</h4>
                <p className="text-xs text-[var(--mu)]">{feature.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link to="/" className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-600">
          Volver al Inicio
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Layout>
  );
}
