import { RefreshCw, AlertCircle, FileText } from "lucide-react";
import { Registro } from "../../types";

interface Props {
  registros: Registro[];
  loading: boolean;
  error: string | null;
  onSelect: (r: Registro) => void;
  onRetry: () => void;
}

export function RegistrosTable({ registros, loading, error, onSelect, onRetry }: Props) {
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
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
            <th className="py-3.5 px-4">Campamentero</th>
            <th className="py-3.5 px-4">Edad</th>
            <th className="py-3.5 px-4 text-center">Talla</th>
            <th className="py-3.5 px-4">DUI / Pasaporte</th>
            <th className="py-3.5 px-4">Celular</th>
            <th className="py-3.5 px-4 text-center">Tipo Pago</th>
            <th className="py-3.5 px-4 text-right">Registro</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e5e7eb]">
          {registros.map((reg) => (
            <tr key={reg.id} onClick={() => onSelect(reg)} className="hover:bg-muted/30 active:bg-muted/50 cursor-pointer transition-colors">
              <td className="py-3.5 px-4 font-bold text-foreground">
                {reg.primer_nombre} {reg.segundo_nombre || ""} {reg.apellidos}
                <span className="block font-normal text-[10px] text-muted-foreground capitalize">{reg.genero}</span>
              </td>
              <td className="py-3.5 px-4">
                {reg.edad} anos
                {reg.edad < 18 ? (
                  <span className="ml-1.5 inline-block text-[9px] font-black uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Menor</span>
                ) : (
                  <span className="ml-1.5 inline-block text-[9px] font-black uppercase bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full">Adulto</span>
                )}
              </td>
              <td className="py-3.5 px-4 text-center font-semibold text-foreground">{reg.talla_camisa || "-"}</td>
              <td className="py-3.5 px-4 font-mono text-xs">{reg.dui_pasaporte}</td>
              <td className="py-3.5 px-4">{reg.celular}</td>
              <td className="py-3.5 px-4 text-center">
                <span className={`inline-block text-[10px] font-bold capitalize px-2 py-0.5 rounded-full ${reg.tipo_pago === "completo" ? "bg-secondary/10 text-secondary border border-secondary/20" : "bg-amber-500/10 text-amber-700 border border-amber-500/20"}`}>
                  {reg.tipo_pago}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right text-muted-foreground text-xs font-mono">
                {new Date(reg.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
