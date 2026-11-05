import { useState, useMemo } from "react";
import { X, ArrowRightLeft, AlertTriangle, Loader2 } from "lucide-react";
import { Cabana } from "./DistribucionCabanas";
import { supabase } from "../../utils/supabase";
import { esCabanaExclusivaBoanerges } from "../../utils/constants";
import { toast } from "sonner";

interface CampamenteroResumen {
  id: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  tipo_documento?: string | null;
  numero_documento?: string | null;
  celular?: string | null;
  genero: string;
  edad?: number | null;
  fecha_nacimiento?: string | null;
  cabana_id: string | null;
  es_lider?: boolean | null;
  es_empleado?: boolean | null;
  es_boanerges?: boolean | null;
  es_boanergues?: boolean | null;
  es_exclusion?: boolean | null;
  tipo_pago?: string | null;
}

interface MoverCampamenteroModalProps {
  isOpen: boolean;
  persona: CampamenteroResumen | null;
  cabanaActual: Cabana | null;
  todasLasCabanas: Cabana[];
  campamenteros: CampamenteroResumen[];
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

export default function MoverCampamenteroModal({
  isOpen,
  persona,
  cabanaActual,
  todasLasCabanas,
  campamenteros,
  onClose,
  onSuccess,
}: MoverCampamenteroModalProps) {
  const [destinoId, setDestinoId] = useState<string>("");
  const [procesando, setProcesando] = useState(false);

  // Cabañas destino disponibles: estrictamente del mismo género que la persona
  const cabanasOpciones = useMemo(() => {
    if (!persona) return [];
    const esMascPersona = persona.genero?.toLowerCase().startsWith("m") ?? false;
    return todasLasCabanas.filter((c) => {
      // Excluir la cabaña en la que ya está
      if (cabanaActual && c.id === cabanaActual.id) return false;
      // Solo cabañas del mismo género
      const esMascCabana = c.genero?.toLowerCase().startsWith("m") ?? false;
      return esMascPersona === esMascCabana;
    });
  }, [todasLasCabanas, persona, cabanaActual]);

  // Si no hay destino seleccionado o cambió la persona, seleccionar la primera
  const cabanaDestinoSeleccionada = useMemo(() => {
    return todasLasCabanas.find((c) => c.id === destinoId) || cabanasOpciones[0] || null;
  }, [todasLasCabanas, destinoId, cabanasOpciones]);

  if (!isOpen || !persona) return null;

  const nombreCompleto = `${persona.primer_nombre} ${persona.segundo_nombre || ""} ${persona.primer_apellido} ${persona.segundo_apellido || ""}`.replace(/\s+/g, " ").trim();

  // Calcular ocupación de la cabaña destino
  const ocupantesDestino = cabanaDestinoSeleccionada
    ? campamenteros.filter((p) => p.cabana_id === cabanaDestinoSeleccionada.id && !p.es_exclusion)
    : [];
  const ocupadosDestino = ocupantesDestino.length;
  const capacidadDestino = cabanaDestinoSeleccionada?.capacidad || 0;
  const esSobregiro = ocupadosDestino >= capacidadDestino;
  const sobregiroCantidad = Math.max(0, ocupadosDestino + 1 - capacidadDestino);

  const esExclusivaBoanergesDestino = cabanaDestinoSeleccionada
    ? esCabanaExclusivaBoanerges(cabanaDestinoSeleccionada)
    : false;
  const advertenciaBoanerges = esExclusivaBoanergesDestino && !persona.es_boanerges && !persona.es_lider;

  const handleMover = async () => {
    if (!cabanaDestinoSeleccionada) {
      toast.error("Por favor selecciona una cabaña de destino.");
      return;
    }

    setProcesando(true);
    try {
      const { error } = await supabase
        .from("inscripciones")
        .update({ cabana_id: cabanaDestinoSeleccionada.id })
        .eq("id", persona.id);

      if (error) throw error;

      toast.success(`${nombreCompleto} trasladado(a) a "${cabanaDestinoSeleccionada.nombre}".`);
      await onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error al mover de cabaña:", err);
      toast.error(err.message || "No se pudo mover a la nueva cabaña.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-border shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="bg-slate-900 text-white p-5 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-emerald-400 flex items-center justify-center border border-primary/30">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-['Outfit',sans-serif] tracking-tight text-white">
                Mover a Otra Cabaña
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-5">
          {/* Tarjeta de la Persona */}
          <div className="p-4 bg-muted/40 rounded-2xl border border-border space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Campamentero / Líder a Trasladar:
            </span>
            <h3 className="text-base font-black text-foreground">
              {nombreCompleto}
            </h3>
            <div className="text-xs text-muted-foreground flex items-center gap-2 pt-0.5">
              <span>Cabaña actual:</span>
              <strong className="text-foreground bg-white px-2 py-0.5 rounded-md border border-border font-bold">
                {cabanaActual ? cabanaActual.nombre : "Sin cabaña asignada"}
              </strong>
            </div>
          </div>

          {/* Selector de Cabaña Destino */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground block">
              Selecciona la Cabaña Destino:
            </label>

            <select
              value={destinoId || cabanaDestinoSeleccionada?.id || ""}
              onChange={(e) => setDestinoId(e.target.value)}
              disabled={procesando}
              className="w-full px-3.5 py-2.5 text-xs font-bold border border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-2xs"
            >
              {cabanasOpciones.length === 0 ? (
                <option value="">No hay otras cabañas disponibles del mismo género</option>
              ) : (
                cabanasOpciones.map((c) => {
                  const ocup = campamenteros.filter((p) => p.cabana_id === c.id && !p.es_exclusion).length;
                  const lib = c.capacidad - ocup;
                  const estado = lib > 0 ? `${lib} libres` : `Sobregiro (${ocup}/${c.capacidad})`;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.nombre} — {ocup}/{c.capacidad} cupos · {estado} {c.solo_boanerges ? "⚡ Boanerges" : ""}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Alertas sólo si aplican (Sobregiro o Exclusiva Boanerges) */}
          {cabanaDestinoSeleccionada && (
            <div className="space-y-2">
              {esSobregiro && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-300 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-950 space-y-0.5">
                    <strong>Aviso de Sobregiro:</strong>
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      La cabaña <strong>{cabanaDestinoSeleccionada.nombre}</strong> tiene {ocupadosDestino}/{capacidadDestino} camas ocupadas.
                      Quedará en sobregiro con <strong>{ocupadosDestino + 1} / {capacidadDestino} cupos</strong> (+{sobregiroCantidad}).
                    </p>
                  </div>
                </div>
              )}

              {advertenciaBoanerges && (
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-300 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-950 space-y-0.5">
                    <strong>Cabaña Exclusiva Boanerges:</strong>
                    <p className="text-[11px] text-rose-900/90 leading-relaxed">
                      Esta cabaña es exclusiva para Boanerges y la persona no tiene el distintivo.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="px-4 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleMover}
            disabled={procesando || !cabanaDestinoSeleccionada}
            className="px-5 py-2 text-xs font-black text-white bg-primary hover:bg-primary/90 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {procesando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Moviendo...</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                <span>Confirmar Traslado</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

