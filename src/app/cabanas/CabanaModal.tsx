import { useState, useEffect } from "react";
import { X, Tent, Zap, Trash2, AlertTriangle, Loader2, Check } from "lucide-react";
import { supabase } from "../../utils/supabase";
import { BUSES_OFICIALES } from "../../utils/constants";
import { Cabana } from "./DistribucionCabanas";
import { toast } from "sonner";

interface CabanaModalProps {
  isOpen: boolean;
  cabana: Cabana | null; // null si es creación, objeto si es edición
  busesExistentes: string[];
  ocupantesCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CabanaModal({
  isOpen,
  cabana,
  busesExistentes,
  ocupantesCount,
  onClose,
  onSuccess,
}: CabanaModalProps) {
  const isEditing = Boolean(cabana);

  // Form State
  const [nombre, setNombre] = useState("");
  const [genero, setGenero] = useState<"Masculino" | "Femenino">("Masculino");
  const [capacidad, setCapacidad] = useState<number>(12);
  const [cantidadLideres, setCantidadLideres] = useState<number>(1);
  const [bus, setBus] = useState<string>("Sin Bus");
  const [busPersonalizado, setBusPersonalizado] = useState("");
  const [soloBoanerges, setSoloBoanerges] = useState(false);

  // Action states
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar datos al abrir o cambiar de cabaña
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setConfirmDelete(false);

      if (cabana) {
        setNombre(cabana.nombre || "");
        setGenero(cabana.genero.toLowerCase().startsWith("fem") ? "Femenino" : "Masculino");
        setCapacidad(cabana.capacidad || 12);
        setCantidadLideres(cabana.cantidad_lideres || 1);
        setSoloBoanerges(Boolean(cabana.solo_boanerges));

        if (!cabana.bus) {
          setBus("Sin Bus");
          setBusPersonalizado("");
        } else if (busesExistentes.includes(cabana.bus)) {
          setBus(cabana.bus);
          setBusPersonalizado("");
        } else {
          setBus("otro");
          setBusPersonalizado(cabana.bus);
        }
      } else {
        // Valores por defecto para nueva cabaña
        setNombre("");
        setGenero("Masculino");
        setCapacidad(14);
        setCantidadLideres(1);
        setBus("Sin Bus");
        setBusPersonalizado("");
        setSoloBoanerges(false);
      }
    }
  }, [isOpen, cabana, busesExistentes]);

  if (!isOpen) return null;

  // Lista de buses ordenada y normalizada
  const opcionesBuses = Array.from(new Set([
    ...BUSES_OFICIALES,
    ...busesExistentes
  ])).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setErrorMessage("El nombre de la cabaña es obligatorio.");
      return;
    }

    if (capacidad < 1 || capacidad > 100) {
      setErrorMessage("La capacidad debe estar entre 1 y 100 camas.");
      return;
    }

    if (cantidadLideres < 0 || cantidadLideres > 10) {
      setErrorMessage("La cantidad de líderes debe ser entre 0 y 10.");
      return;
    }

    let busFinal: string | null = null;
    if (bus === "otro") {
      busFinal = busPersonalizado.trim() ? busPersonalizado.trim() : null;
    } else if (bus !== "Sin Bus") {
      busFinal = bus;
    }

    setSaving(true);
    try {
      if (isEditing && cabana) {
        // Actualizar cabaña existente
        const { error: updErr } = await supabase
          .from("cabanas")
          .update({
            nombre: nombreLimpio,
            genero,
            capacidad,
            cantidad_lideres: cantidadLideres,
            bus: busFinal,
            solo_boanerges: soloBoanerges,
          })
          .eq("id", cabana.id);

        if (updErr) throw updErr;

        toast.success(`Cabaña "${nombreLimpio}" actualizada exitosamente.`);
      } else {
        // Crear nueva cabaña
        const { error: insErr } = await supabase
          .from("cabanas")
          .insert([
            {
              nombre: nombreLimpio,
              genero,
              capacidad,
              cantidad_lideres: cantidadLideres,
              bus: busFinal,
              solo_boanerges: soloBoanerges,
            },
          ]);

        if (insErr) throw insErr;

        toast.success(`Cabaña "${nombreLimpio}" creada con éxito.`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error al guardar cabaña:", err);
      if (err.code === "23505" || err.message?.includes("unique")) {
        setErrorMessage(`Ya existe una cabaña con el nombre "${nombreLimpio}".`);
      } else {
        setErrorMessage(err.message || "Error al guardar los datos de la cabaña.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!cabana) return;
    setDeleting(true);
    setErrorMessage(null);

    try {
      // 1. Desasignar a todas las personas vinculadas a esta cabaña para no violar llaves foráneas
      const { error: unlinkErr } = await supabase
        .from("inscripciones")
        .update({ cabana_id: null })
        .eq("cabana_id", cabana.id);

      if (unlinkErr) {
        console.warn("Advertencia al desasignar personas:", unlinkErr.message);
      }

      // 2. Eliminar la cabaña
      const { error: delErr } = await supabase
        .from("cabanas")
        .delete()
        .eq("id", cabana.id);

      if (delErr) throw delErr;

      toast.success(`Cabaña "${cabana.nombre}" eliminada correctamente.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Error al eliminar cabaña:", err);
      setErrorMessage(err.message || "No se pudo eliminar la cabaña.");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-border bg-slate-50 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Tent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground font-['Outfit',sans-serif]">
                {isEditing ? `Editar Cabaña` : `Nueva Cabaña`}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="font-semibold text-xs">{errorMessage}</span>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
              Nombre de la Cabaña <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Koinonia 5, Bethel, Agape 5..."
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
            />
          </div>

          {/* Género */}
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5">
              Género Destinado <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGenero("Masculino")}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  genero === "Masculino"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Masculino
              </button>
              <button
                type="button"
                onClick={() => setGenero("Femenino")}
                className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  genero === "Femenino"
                    ? "bg-pink-600 text-white border-pink-600 shadow-sm"
                    : "bg-muted/30 border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Femenino
              </button>
            </div>
          </div>

          {/* Capacidad y Cantidad de Líderes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                Capacidad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={capacidad}
                onChange={(e) => setCapacidad(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
                Líderes Requeridos <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                max={10}
                required
                value={cantidadLideres}
                onChange={(e) => setCantidadLideres(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-bold"
              />
            </div>
          </div>

          {/* Bus Asignado */}
          <div>
            <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1">
              Bus de Transporte Asignado
            </label>
            <div className="flex gap-2">
              <select
                value={bus}
                onChange={(e) => setBus(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-bold border border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="Sin Bus">Sin Bus Asignado</option>
                {opcionesBuses.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
                <option value="otro">+ Escribir otro bus...</option>
              </select>

              {bus === "otro" && (
                <input
                  type="text"
                  placeholder="Ej: Bus #10"
                  value={busPersonalizado}
                  onChange={(e) => setBusPersonalizado(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-bold border border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              )}
            </div>
          </div>

          {/* Checkbox Cabaña Exclusiva Boanerges */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
            <input
              type="checkbox"
              id="solo_boanerges"
              checked={soloBoanerges}
              onChange={(e) => setSoloBoanerges(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="solo_boanerges" className="cursor-pointer select-none font-bold text-xs text-emerald-950 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              Cabaña Exclusiva para Campamenteros Boanerges
            </label>
          </div>

          {/* Zona de peligro: Eliminar Cabaña si está en edición */}
          {isEditing && (
            <div className="pt-2 border-t border-border">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Eliminar Cabaña
                </button>
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <div className="flex items-start gap-2 text-red-800">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
                    <div>
                      <p className="font-bold text-xs">¿Estás seguro de eliminar "{cabana?.nombre}"?</p>
                      {ocupantesCount > 0 && (
                        <p className="text-[11px] text-red-700 mt-0.5">
                          Hay <strong>{ocupantesCount} persona(s)</strong> asignada(s). Al eliminar la cabaña, quedarán desasignadas automáticamente (libres).
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Confirmar Eliminación
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || deleting}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-muted/40 hover:bg-muted rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || deleting}
              className="px-5 py-2 text-xs font-bold text-white bg-primary hover:bg-primary/90 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {isEditing ? "Guardar Cambios" : "Crear Cabaña"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
