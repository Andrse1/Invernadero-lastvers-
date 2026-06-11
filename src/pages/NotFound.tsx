import { Link } from "react-router";
import { Sprout, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] text-[var(--tx)]">
      <div className="text-center">
        <Sprout className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
        <h1 className="mb-2 text-4xl font-bold">404</h1>
        <p className="mb-6 text-sm text-[var(--mu)]">Pagina no encontrada</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Inicio
        </Link>
      </div>
    </div>
  );
}
