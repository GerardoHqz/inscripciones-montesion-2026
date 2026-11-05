import { RefreshCw, AlertCircle, FileText } from "lucide-react";
import { Registro } from "../../types";

interface Props {
  registros: Registro[];
  loading: boolean;
  error: string | null;
  onSelect: (r: Registro) => void;
  onRetry: () => void;
  tabActiva: 'activas' | 'solicitudes';
}

export function RegistrosTable({ registros, loading, error, onSelect, onRetry, tabActiva }: Props) {
  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm font-semibold">Cargando registros de inscripcion...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-destructive flex flex-col items-center gap-2 justify-center">
      <AlertCircle className="w-8 h-8" />
      <p className="font-semibold text-sm">{error}</p>
      <button onClick={onRetry} className="mt-2 px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg">Reintentar</button>
    </div>
  );

  if (registros.length === 0) return (
    <div className="p-12 text-center text-muted-foreground">
      <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
      <p className="text-sm font-semibold">No se encontraron inscripciones registradas.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto overflow-y-auto max-h-[580px] relative">
      <table className="w-full text-left border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-slate-50 shadow-xs border-b border-border">
          <tr className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
            <th className="py-3.5 px-4 bg-slate-50">Campamentero</th>
            <th className="py-3.5 px-4 bg-slate-50">Edad</th>
            <th className="py-3.5 px-4 text-center bg-slate-50">Talla</th>
            <th className="py-3.5 px-4 bg-slate-50">DUI / Pasaporte</th>
            <th className="py-3.5 px-4 bg-slate-50">Celular</th>
            {tabActiva === "activas" ? (
              <th className="py-3.5 px-4 text-left bg-slate-50">Pago</th>
            ) : (
              <th className="py-3.5 px-4 text-center bg-slate-50">Estado</th>
            )}
            <th className="py-3.5 px-4 text-right bg-slate-50">Registro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {registros.map((reg) => (
            <tr key={reg.id} onClick={() => onSelect(reg)} className="hover:bg-muted/30 active:bg-muted/50 cursor-pointer transition-colors">
              <td className="py-3.5 px-4 font-bold text-foreground">
                {reg.primer_nombre} {reg.segundo_nombre || ""} {reg.primer_apellido} {reg.segundo_apellido || ""}
                <span className="block font-normal text-[10px] text-muted-foreground capitalize">
                  {reg.genero}
                </span>
              </td>
              <td className="py-3.5 px-4">
                {reg.edad} años
                {reg.edad < 18 ? (
                  <span className="ml-1.5 inline-block text-[9px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Menor</span>
                ) : (
                  <span className="ml-1.5 inline-block text-[9px] font-black uppercase bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full">Adulto</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-center font-semibold text-foreground">{reg.talla_camisa || "-"}</td>
              <td className="py-3.5 px-4 font-mono text-xs"><span className="text-[10px] font-bold text-muted-foreground mr-1">{reg.tipo_documento}:</span>{reg.numero_documento}</td>
              <td className="py-3.5 px-4">{reg.celular}</td>
              {tabActiva === "activas" ? (
                <td className="py-3.5 px-4 text-left">
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    reg.tipo_pago === "completo"
                      ? "bg-secondary/10 text-secondary border border-secondary/20"
                      : reg.tipo_pago === "medio pago"
                      ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                      : reg.tipo_pago === "media beca"
                      ? "bg-teal-500/10 text-teal-700 border border-teal-500/20"
                      : reg.tipo_pago === "becado"
                      ? "bg-purple-500/10 text-purple-700 border border-purple-500/20"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {reg.tipo_pago === "completo" ? "Pago Completo" : reg.tipo_pago === "medio pago" ? "Medio Pago" : reg.tipo_pago === "media beca" ? "Media Beca" : reg.tipo_pago === "becado" ? "Becado" : reg.tipo_pago}
                  </span>
                </td>
              ) : (
                <td className="py-3.5 px-4 text-center">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
                    Sin Pago
                  </span>
                </td>
              )}
              <td className="py-3.5 px-4 text-right text-muted-foreground text-xs font-mono">
                {reg.created_at ? new Date(reg.created_at).toLocaleDateString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
