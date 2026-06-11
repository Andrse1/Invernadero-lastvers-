import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TableColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

interface HistoricTableProps {
  title: string;
  data: Record<string, unknown>[];
  columns: TableColumn[];
  loading?: boolean;
}

export default function HistoricTable({ title, data, columns, loading }: HistoricTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--mu)]">{title}</h3>
        <div className="flex items-center gap-2 py-8 text-sm text-[var(--mu)]">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--bd2)] border-t-emerald-500" />
          Cargando datos...
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--mu)]">{title}</h3>
        <p className="py-4 text-sm text-[var(--mu)]">Sin datos registrados</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--bd)] bg-[var(--su)] p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--mu)]">
        {title} ({data.length} registros)
      </h3>
      <div className="max-h-96 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--bd)]">
              {columns.map((col) => (
                <th key={col.key} className="px-2 py-2 text-left font-semibold uppercase tracking-wider text-[var(--mu)]">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-[var(--bd)]/50 transition-colors hover:bg-[var(--s2)]">
                {columns.map((col) => {
                  const rawValue = row[col.key];
                  let displayValue: string;
                  if (col.format) {
                    displayValue = col.format(rawValue);
                  } else if (rawValue instanceof Date) {
                    displayValue = format(rawValue, "dd/MM/yyyy HH:mm:ss", { locale: es });
                  } else {
                    displayValue = String(rawValue ?? "—");
                  }
                  return (
                    <td key={col.key} className="px-2 py-2 font-mono text-[var(--tx)]">
                      {displayValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
