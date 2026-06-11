import { Link, useLocation } from "react-router";
import { useTheme } from "@/providers/ThemeProvider";
import { Sun, Moon, Sprout, Home } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const navItems = [
    { path: "/co2", label: "CO2" },
    { path: "/nebulizador", label: "Nebulizador" },
    { path: "/iluminacion", label: "Iluminacion" },
    { path: "/riego", label: "Sistema de Riego" },
    { path: "/fotovoltaico", label: "Sistema Fotovoltaico" },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tx)] transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-[var(--bd)] bg-[var(--su)] px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          {!isHome && (
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg border border-[var(--bd2)] bg-[var(--s2)] px-3 py-2 text-sm font-medium text-[var(--tx)] transition-all hover:bg-[var(--s3)]"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Inicio</span>
            </Link>
          )}

          <div className="flex items-center gap-2">
            <Sprout className="h-6 w-6 text-emerald-500" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                {title || "Greenhouse Server"}
              </h1>
              {subtitle && (
                <p className="text-[10px] uppercase tracking-widest text-[var(--mu)]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-lg border border-[var(--bd2)] bg-[var(--s2)] px-3 py-2 text-sm transition-all hover:bg-[var(--s3)]"
              title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
              <span className="hidden text-xs uppercase tracking-wider text-[var(--mu)] sm:inline">
                {theme === "dark" ? "Claro" : "Oscuro"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      {!isHome && (
        <nav className="border-b border-[var(--bd)] bg-[var(--su)] px-4 md:px-6">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`whitespace-nowrap rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "text-[var(--mu)] hover:bg-[var(--s2)] hover:text-[var(--tx)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
