import { useState, useMemo } from "react";
import { 
  X, Sparkles, AlertTriangle, ShieldCheck, Users, 
  CheckCircle2, Loader2, Zap
} from "lucide-react";
import { toast } from "sonner";
import { 
  CampamenteroData, 
  CabanaData, 
  calcularAsignacionAutomatica, 
  guardarAsignacionesSupabase,
  calcularEdadPersona 
} from "../../utils/cabinAssignment";
import { useConfiguracionEvento } from "../../hooks/useConfiguracionEvento";

interface AsignarCabanasModalProps {
  isOpen: boolean;
  cabanas: CabanaData[];
  campamenteros: CampamenteroData[];
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

export default function AsignarCabanasModal({
  isOpen,
  cabanas,
  campamenteros,
  onClose,
  onSuccess,
}: AsignarCabanasModalProps) {
  const { config } = useConfiguracionEvento();
  // Modo de asignación: "solo_sin_cabana" o "todos_no_lideres"
  const [modo, setModo] = useState<"solo_sin_cabana" | "todos_no_lideres">("todos_no_lideres");
  
  // Estado de procesamiento
  const [procesando, setProcesando] = useState(false);
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
  const [fase, setFase] = useState<string>("");

  // Conteos y métricas previas
  const stats = useMemo(() => {
    // Prioridad y elegibilidad: solo personas con pago registrado O que cuenten con flag de líder
    const elegibles = campamenteros.filter((c) => (c.tipo_pago !== null && c.tipo_pago !== undefined) || Boolean(c.es_lider));
    const lideres = elegibles.filter((c) => Boolean(c.es_lider));
    const noLideres = elegibles.filter((c) => !c.es_lider);

    const pendientes = noLideres.filter((c) => !c.cabana_id);
    const asignados = noLideres.filter((c) => Boolean(c.cabana_id));

    const candidatos = modo === "solo_sin_cabana" ? pendientes : noLideres;

    const masc = candidatos.filter((c) => c.genero.toLowerCase().startsWith("m"));
    const fem = candidatos.filter((c) => c.genero.toLowerCase().startsWith("f"));

    const mascMenores = masc.filter((c) => calcularEdadPersona(c) < config.edadMayoriaEdad).length;
    const mascMayores = masc.filter((c) => calcularEdadPersona(c) >= config.edadMayoriaEdad).length;
    const mascBoan = masc.filter((c) => Boolean(c.es_boanerges || c.es_boanergues)).length;

    const femMenores = fem.filter((c) => calcularEdadPersona(c) < config.edadMayoriaEdad).length;
    const femMayores = fem.filter((c) => calcularEdadPersona(c) >= config.edadMayoriaEdad).length;
    const femBoan = fem.filter((c) => Boolean(c.es_boanerges || c.es_boanergues)).length;

    // Capacidad disponible en cabañas
    const durmientesPorCabana: Record<string, number> = {};
    cabanas.forEach((c) => (durmientesPorCabana[c.id] = 0));

    // Líderes siempre ocupan si no tienen exclusión
    lideres.forEach((l) => {
      if (l.cabana_id && !l.es_exclusion && durmientesPorCabana[l.cabana_id] !== undefined) {
        durmientesPorCabana[l.cabana_id]++;
      }
    });

    if (modo === "solo_sin_cabana") {
      asignados.forEach((p) => {
        if (p.cabana_id && !p.es_exclusion && durmientesPorCabana[p.cabana_id] !== undefined) {
          durmientesPorCabana[p.cabana_id]++;
        }
      });
    }

    let camasLibresMasc = 0;
    let camasLibresFem = 0;
    cabanas.forEach((c) => {
      const libres = Math.max(0, c.capacidad - (durmientesPorCabana[c.id] || 0));
      if (c.genero.toLowerCase().startsWith("m")) camasLibresMasc += libres;
      else camasLibresFem += libres;
    });

    return {
      totalLideres: lideres.length,
      totalPendientes: pendientes.length,
      totalYaAsignados: asignados.length,
      totalCandidatos: candidatos.length,
      totalNoLideres: noLideres.length,
      masc: { total: masc.length, menores: mascMenores, mayores: mascMayores, boanerges: mascBoan, camasLibres: camasLibresMasc },
      fem: { total: fem.length, menores: femMenores, mayores: femMayores, boanerges: femBoan, camasLibres: camasLibresFem },
    };
  }, [campamenteros, cabanas, modo, config.edadMayoriaEdad]);

  if (!isOpen) return null;

  const handleEjecutar = async () => {
    if (stats.totalCandidatos === 0) {
      toast.info("No hay campamenteros pendientes para asignar con la opción seleccionada.");
      return;
    }

    setProcesando(true);
    setFase("Calculando distribución equilibrada...");
    setProgreso({ actual: 0, total: stats.totalCandidatos });

    try {
      // 1. Calcular distribución aleatoria y balanceada
      const { updates, resumen } = calcularAsignacionAutomatica(campamenteros, cabanas, {
        soloSinCabana: modo === "solo_sin_cabana",
        edadMayoria: config.edadMayoriaEdad,
      });

      if (updates.length === 0) {
        toast.warning("No se generaron asignaciones. Verifica que haya cabañas con camas disponibles.");
        setProcesando(false);
        return;
      }

      setFase(`Guardando ${updates.length} asignaciones en la base de datos...`);
      setProgreso({ actual: 0, total: updates.length });

      // 2. Guardar en Supabase en lotes
      await guardarAsignacionesSupabase(updates, (actual, total) => {
        setProgreso({ actual, total });
      });

      // 3. Notificación de éxito
      toast.success("¡Cabañas asignadas exitosamente!", {
        description: `Se distribuyeron ${resumen.totalAsignados} campamenteros equilibradamente. Los ${resumen.lideresProtegidos} líderes mantuvieron su cabaña intacta.`,
      });

      await onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error al asignar cabañas:", err);
      toast.error(err.message || "Error al guardar las asignaciones en la base de datos.");
    } finally {
      setProcesando(false);
    }
  };

  const porcentajeProgreso = progreso.total > 0 
    ? Math.round((progreso.actual / progreso.total) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-border shadow-2xl w-full max-w-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Uso Exclusivo Administrador
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-['Outfit',sans-serif] tracking-tight mt-1 text-white">
                Asignar Cabañas Automáticamente
              </h2>
            </div>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-5 max-h-[calc(85vh-160px)] overflow-y-auto">
          
          {/* Advertencia / Confirmación destacada */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-amber-950">
                ¿Está seguro que desea {modo === "todos_no_lideres" ? "reasignar" : "asignar"} las cabañas?
              </p>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Esta acción distribuirá a los campamenteros de forma <strong>aleatoria y equilibrada</strong> respetando todas las reglas del campamento Monte Sión 2026.
              </p>
            </div>
          </div>

          {/* Reglas de Asignación en Tarjetas */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Reglas y Criterios que se Aplicarán:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block">División por Género</strong>
                  <span className="text-muted-foreground text-[11px]">
                    Varones en cabañas masculinas y señoritas en cabañas femeninas.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block">Equilibrio Menores / Mayores</strong>
                  <span className="text-muted-foreground text-[11px]">
                    Menores (&lt;18) y mayores (&ge;18) divididos equitativamente en cada cabaña.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground block">Criterio Boanerges</strong>
                  <span className="text-muted-foreground text-[11px]">
                    Cabañas exclusivas Boanerges solo albergan campamenteros Boanerges.
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-950 block">Protección de Líderes</strong>
                  <span className="text-amber-900/80 text-[11px]">
                    Los <strong>{stats.totalLideres} líderes</strong> ya asignados NO se moverán bajo ninguna circunstancia.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selector de Modo */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Seleccione el Alcance:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label 
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  modo === "todos_no_lideres"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border hover:border-border/80 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="modo_asignacion"
                    checked={modo === "todos_no_lideres"}
                    onChange={() => setModo("todos_no_lideres")}
                    disabled={procesando}
                    className="mt-1 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold text-xs text-foreground block">
                      Reasignar a todos los campamenteros
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      Mueve aleatoriamente a todos los {stats.totalNoLideres} campamenteros (conservando líderes intactos).
                    </span>
                  </div>
                </div>
              </label>

              <label 
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  modo === "solo_sin_cabana"
                    ? "border-primary bg-primary/5 shadow-xs"
                    : "border-border hover:border-border/80 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="modo_asignacion"
                    checked={modo === "solo_sin_cabana"}
                    onChange={() => setModo("solo_sin_cabana")}
                    disabled={procesando}
                    className="mt-1 text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold text-xs text-foreground block">
                      Solo pendientes (sin cabaña)
                    </span>
                    <span className="text-[11px] text-muted-foreground mt-0.5 block">
                      Asigna únicamente a los {stats.totalPendientes} campamenteros que aún no tienen cabaña.
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Resumen Demográfico en Vivo */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4 text-primary" />
                Campamenteros a Asignar en esta Ejecución:
              </span>
              <span className="font-black text-sm text-primary">
                {stats.totalCandidatos} personas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200/80 text-blue-950">
                <span className="font-black text-[11px] block uppercase tracking-wide text-blue-800">
                  Varones ({stats.masc.total})
                </span>
                <div className="text-[11px] mt-1 space-y-0.5">
                  <p>• Menores (&lt;18): <strong>{stats.masc.menores}</strong></p>
                  <p>• Mayores (&ge;18): <strong>{stats.masc.mayores}</strong></p>
                  {stats.masc.boanerges > 0 && (
                    <p>• Boanerges: <strong>{stats.masc.boanerges}</strong></p>
                  )}
                  <p className="text-blue-700/80 pt-0.5">Camas libres disponibles: <strong>{stats.masc.camasLibres}</strong></p>
                </div>
              </div>

              <div className="p-2.5 bg-pink-50/80 rounded-xl border border-pink-200/80 text-pink-950">
                <span className="font-black text-[11px] block uppercase tracking-wide text-pink-800">
                  Señoritas ({stats.fem.total})
                </span>
                <div className="text-[11px] mt-1 space-y-0.5">
                  <p>• Menores (&lt;18): <strong>{stats.fem.menores}</strong></p>
                  <p>• Mayores (&ge;18): <strong>{stats.fem.mayores}</strong></p>
                  {stats.fem.boanerges > 0 && (
                    <p>• Boanerges: <strong>{stats.fem.boanerges}</strong></p>
                  )}
                  <p className="text-pink-700/80 pt-0.5">Camas libres disponibles: <strong>{stats.fem.camasLibres}</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de Progreso en Vivo */}
          {procesando && (
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {fase}
                </span>
                <span className="font-black text-primary">{porcentajeProgreso}%</span>
              </div>
              <div className="w-full bg-primary/20 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${porcentajeProgreso}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                Guardando en Supabase: {progreso.actual} de {progreso.total} registros
              </p>
            </div>
          )}

        </div>

        {/* Footer con Botones de Acción */}
        <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={procesando}
            className="px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleEjecutar}
            disabled={procesando || stats.totalCandidatos === 0}
            className="px-5 py-2.5 text-xs font-black text-white bg-primary hover:bg-primary/90 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {procesando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Asignando Cabañas...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                Confirmar y Asignar Cabañas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

