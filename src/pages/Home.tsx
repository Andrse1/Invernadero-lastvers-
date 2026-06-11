import { Link } from "react-router";
import {
  CloudFog,
  Droplets,
  Sun,
  Sprout,
  Zap,
  ArrowRight,
} from "lucide-react";

const projects = [
  {
    id: "co2",
    title: "CO2",
    description: "Monitoreo de concentracion de CO2, humedad y temperatura ambiental",
    icon: CloudFog,
    color: "#10b981",
    path: "/co2",
    sensors: ["Humedad", "Temperatura", "CO2"],
  },
  {
    id: "nebulizador",
    title: "Nebulizador",
    description: "Control de humedad mediante sistema de nebulizacion",
    icon: Droplets,
    color: "#06b6d4",
    path: "/nebulizador",
    sensors: ["Humedad"],
  },
  {
    id: "iluminacion",
    title: "Iluminacion",
    description: "Monitoreo de espectro luminoso, PPFD y DLI acumulado",
    icon: Sun,
    color: "#f59e0b",
    path: "/iluminacion",
    sensors: ["PPFD", "DLI", "Espectro"],
  },
  {
    id: "riego",
    title: "Sistema de Riego",
    description: "Gestion de temperatura, humedad y nutrientes del suelo",
    icon: Sprout,
    color: "#22c55e",
    path: "/riego",
    sensors: ["Temp. Suelo", "Temp. Amb.", "Hum. Amb.", "Hum. Suelo", "K", "P", "N"],
  },
  {
    id: "fotovoltaico",
    title: "Sistema Fotovoltaico",
    description: "Monitoreo de paneles solares y eficiencia energetica",
    icon: Zap,
    color: "#3b82f6",
    path: "/fotovoltaico",
    sensors: ["En desarrollo"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tx)] transition-colors duration-300">
      <header className="border-b border-[var(--bd)] bg-[var(--su)] px-6 py-8">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-3 flex items-center justify-center gap-3">
            <Sprout className="h-10 w-10 text-emerald-500" />
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Greenhouse Server
            </h1>
          </div>
          <p className="mx-auto max-w-xl text-sm uppercase tracking-widest text-[var(--mu)]">
            Sistema de Monitoreo de Invernadero
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              En linea
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-[0.2em] text-[var(--mu)]">
          Proyectos Activos
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <Link
                key={project.id}
                to={project.path}
                className="group relative overflow-hidden rounded-2xl border border-[var(--bd)] bg-[var(--su)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--bd2)] hover:shadow-lg"
              >
                <div
                  className="absolute left-0 top-0 h-full w-1 transition-all group-hover:w-1.5"
                  style={{ backgroundColor: project.color }}
                />

                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${project.color}15`,
                      border: `1.5px solid ${project.color}30`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: project.color }} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--mu)] transition-transform group-hover:translate-x-1" style={{ color: `${project.color}80` }} />
                </div>

                <h3 className="mb-1 mt-4 text-lg font-bold">{project.title}</h3>
                <p className="mb-4 text-xs leading-relaxed text-[var(--mu)]">{project.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {project.sensors.map((sensor) => (
                    <span
                      key={sensor}
                      className="rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${project.color}10`,
                        color: project.color,
                        border: `1px solid ${project.color}25`,
                      }}
                    >
                      {sensor}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] uppercase tracking-widest text-[var(--mu)]">
            Servidor de Invernadero v1.0 &middot; Datos en tiempo real
          </p>
        </div>
      </main>
    </div>
  );
}
