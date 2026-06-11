import { useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";

interface VariableOption {
  key: string;
  label: string;
}

interface CsvExportProps {
  variables: VariableOption[];
  onExport: (variable: string, desde: string, hasta: string) => Promise<Record<string, unknown>[]>;
}

export default function CsvExport({ variables, onExport }: CsvExportProps) {
  const [selectedVariable, setSelectedVariable] = useState<string>("todas");
  const [desde, setDesde] = useState<string>("");
  const [hasta, setHasta] = useState<string>("");
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await onExport(selectedVariable, desde, hasta);
      if (!data || data.length === 0) {
        alert("No hay datos para el rango seleccionado.");
        return;
      }

      // Build CSV
      const headers = Object.keys(data[0]);
      const csvRows = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((h) => {
              const val = row[h];
              if (val instanceof Date) {
                return `"${val.toLocaleString("es-ES")}"`;
              }
              const str = String(val ?? "");
              if (str.includes(",") || str.includes('"')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(","),
        ),
      ];

      const csvContent = "\uFEFF" + csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const variableLabel = selectedVariable === "todas" ? "todas" : variables.find((v) => v.key === selectedVariable)?.label || selectedVariable;
      const dateStr = desde || hasta ? `_${desde}_${hasta}` : "";
      link.download = `greenhouse_${variableLabel}${dateStr}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Error al exportar datos.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--bd2)] bg-[var(--su)] p-5">
      <div className="mb-4 flex items-center gap-2">
        <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--tx)]">
          Exportar Datos a CSV
        </h3>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mu)]">
            Variable
          </label>
          <select
            value={selectedVariable}
            onChange={(e) => setSelectedVariable(e.target.value)}
            className="rounded-lg border border-[var(--bd2)] bg-[var(--s2)] px-3 py-2 text-sm text-[var(--tx)] outline-none focus:border-emerald-500"
          >
            <option value="todas">Todas las variables</option>
            {variables.map((v) => (
              <option key={v.key} value={v.key}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mu)]">
            Desde
          </label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-lg border border-[var(--bd2)] bg-[var(--s2)] px-3 py-2 text-sm text-[var(--tx)] outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--mu)]">
            Hasta
          </label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-lg border border-[var(--bd2)] bg-[var(--s2)] px-3 py-2 text-sm text-[var(--tx)] outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-emerald-600 disabled:opacity-50"
        >
          {exporting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Descargar CSV
        </button>
      </div>
    </div>
  );
}
