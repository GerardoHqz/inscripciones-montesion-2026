import { useState, useMemo, useEffect } from "react";
import { 
  X, Search, UserPlus, UserMinus, Sparkles, Zap, CreditCard, 
  Phone, BedDouble, Tent, Users, Loader2, Plus, ArrowRightLeft
} from "lucide-react";
import { Cabana } from "./DistribucionCabanas";
import { supabase } from "../../utils/supabase";
import { esCabanaExclusivaBoanerges } from "../../utils/constants";
import MoverCampamenteroModal from "./MoverCampamenteroModal";
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

interface AsignacionManualModalProps {
  isOpen: boolean;
  cabanaInicial: Cabana | null;
  todasLasCabanas: Cabana[];
  campamenteros: CampamenteroResumen[];
  onClose: () => void;
  onDataChanged: () => Promise<void> | void;
}

export default function AsignacionManualModal({
  isOpen,
  cabanaInicial,
  todasLasCabanas,
  campamenteros,
  onClose,
  onDataChanged,
}: AsignacionManualModalProps) {
  // Cabaña activa seleccionada en el modal
  const [cabanaSeleccionadaId, setCabanaSeleccionadaId] = useState<string>(
    cabanaInicial?.id || todasLasCabanas[0]?.id || ""
  );

  // Sincronizar cabaña seleccionada y reiniciar filtros al abrir el modal o cambiar de cabaña inicial
  useEffect(() => {
    if (isOpen && cabanaInicial?.id) {
      setCabanaSeleccionadaId(cabanaInicial.id);
      setTab("disponibles");
      setBusqueda("");
      setSubFiltro("todos");
    }
  }, [isOpen, cabanaInicial]);

  // Pestaña activa: "disponibles", "ocupantes" o "nuevo"
  const [tab, setTab] = useState<"disponibles" | "ocupantes" | "nuevo">("disponibles");

  // Filtros de búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [subFiltro, setSubFiltro] = useState<"todos" | "lideres" | "boanerges" | "reasignables">("todos");

  // Estado de acción
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [personaParaDesasignar, setPersonaParaDesasignar] = useState<CampamenteroResumen | null>(null);

  // Estado para mover a otra cabaña
  const [moverModalOpen, setMoverModalOpen] = useState(false);
  const [personaParaMover, setPersonaParaMover] = useState<CampamenteroResumen | null>(null);

  // Formulario para registrar y asignar nuevo campamentero o líder
  const [nuevoForm, setNuevoForm] = useState({
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    genero: "Masculino",
    edad: "",
    fecha_nacimiento: "",
    celular: "",
    tipo_documento: "DUI" as "DUI" | "PASAPORTE",
    numero_documento: "",
    es_lider: false,
    es_boanerges: false,
    es_exclusion: false,
  });

  // Cabaña activa
  const cabanaActiva = useMemo(() => {
    return todasLasCabanas.find((c) => c.id === cabanaSeleccionadaId) || cabanaInicial || todasLasCabanas[0];
  }, [todasLasCabanas, cabanaSeleccionadaId, cabanaInicial]);

  const esMasculina = cabanaActiva?.genero.toLowerCase().startsWith("masc") ?? false;
  const esExclusivaBoanerges = cabanaActiva ? esCabanaExclusivaBoanerges(cabanaActiva) : false;

  // Filtrado de candidatos para asignar
  const candidatosFiltrados = useMemo(() => {
    if (!cabanaActiva) return [];
    const query = busqueda.toLowerCase().trim();

    return campamenteros.filter((p) => {
      // Prioridad / Elegibilidad: debe tener pago registrado O contar con la flag de líder
      const esElegible = p.tipo_pago !== null || Boolean(p.es_lider);
      if (!esElegible) return false;

      // Si estamos buscando "reasignables", incluimos a los que ya tienen cabaña (excepto la actual)
      if (subFiltro === "reasignables") {
        if (!p.cabana_id || p.cabana_id === cabanaActiva.id) return false;
      } else {
        // En los demás filtros, solo personas SIN cabaña asignada
        if (p.cabana_id !== null) return false;
      }

      // Restricción de género estricta: siempre únicamente personas del mismo género que la cabaña
      const generoPersonaMasc = p.genero?.toLowerCase().startsWith("masc");
      if (esMasculina !== generoPersonaMasc) return false;

      // Subfiltros
      if (subFiltro === "lideres" && !p.es_lider) return false;
      if (subFiltro === "boanerges" && !p.es_boanerges) return false;

      // Búsqueda de texto
      if (query) {
        const nombreCompleto = `${p.primer_nombre || ""} ${p.segundo_nombre || ""} ${p.primer_apellido || ""} ${p.segundo_apellido || ""}`.toLowerCase();
        const coincideNombre = nombreCompleto.includes(query);
        const coincideDoc = (p.numero_documento || "").toLowerCase().includes(query);
        const coincideTel = (p.celular || "").includes(query);
        if (!coincideNombre && !coincideDoc && !coincideTel) return false;
      }

      return true;
    });
  }, [campamenteros, cabanaActiva, subFiltro, esMasculina, busqueda]);

  // Contadores de disponibles
  const conteoDisponibles = useMemo(() => {
    const sinCabana = campamenteros.filter((p) => {
      // Prioridad / Elegibilidad: debe tener pago registrado O contar con la flag de líder
      const esElegible = p.tipo_pago !== null || Boolean(p.es_lider);
      if (!esElegible) return false;

      if (p.cabana_id !== null) return false;
      const masc = p.genero?.toLowerCase().startsWith("masc");
      if (esMasculina !== masc) return false;
      return true;
    });

    const reasignables = campamenteros.filter((p) => {
      const esElegible = p.tipo_pago !== null || Boolean(p.es_lider);
      if (!esElegible) return false;
      if (!p.cabana_id || (cabanaActiva && p.cabana_id === cabanaActiva.id)) return false;
      const masc = p.genero?.toLowerCase().startsWith("masc");
      if (esMasculina !== masc) return false;
      return true;
    });

    return {
      todos: sinCabana.length,
      lideres: sinCabana.filter((p) => p.es_lider).length,
      boanerges: sinCabana.filter((p) => p.es_boanerges).length,
      reasignables: reasignables.length,
    };
  }, [campamenteros, cabanaActiva, esMasculina]);

  // Actualizar género sugerido en el formulario nuevo según la cabaña activa
  useEffect(() => {
    if (cabanaActiva) {
      setNuevoForm((prev) => ({
        ...prev,
        genero: cabanaActiva.genero.toLowerCase().startsWith("m") ? "Masculino" : "Femenino",
        es_boanerges: Boolean(cabanaActiva.solo_boanerges),
      }));
    }
  }, [cabanaActiva]);

  // Si no está abierto o no hay cabaña seleccionable
  if (!isOpen || !cabanaActiva) return null;

  // Ocupantes de la cabaña activa
  const ocupantesActuales = campamenteros.filter((p) => p.cabana_id === cabanaActiva.id);
  const durmientesActuales = ocupantesActuales.filter((p) => !p.es_exclusion);
  const lideresExcluidosActuales = ocupantesActuales.filter((p) => p.es_exclusion);
  const ocupadosCount = durmientesActuales.length;
  const libresCount = Math.max(0, cabanaActiva.capacidad - ocupadosCount);

  // Asignar persona existente a esta cabaña
  const handleAsignar = async (persona: CampamenteroResumen) => {
    // Si la cabaña es exclusiva de Boanerges y la persona NO es Boanerges ni Líder
    if (esExclusivaBoanerges && !persona.es_boanerges && !persona.es_lider) {
      toast.error(
        `La cabaña "${cabanaActiva.nombre}" es exclusiva para campamenteros Boanerges.`,
        { description: "Esta persona no tiene activado el distintivo Boanerges." }
      );
      return;
    }

    setProcesandoId(persona.id);
    try {
      const { error } = await supabase
        .from("inscripciones")
        .update({ cabana_id: cabanaActiva.id })
        .eq("id", persona.id);

      if (error) throw error;

      const nombre = `${persona.primer_nombre} ${persona.primer_apellido}`;
      const sobregiroMsg = libresCount <= 0 && !persona.es_exclusion 
        ? ` (Sobregiro: ${ocupadosCount + 1}/${cabanaActiva.capacidad})` 
        : "";
      toast.success(`${nombre} asignado(a) a ${cabanaActiva.nombre}${sobregiroMsg}.`);
      await onDataChanged();
    } catch (err: any) {
      console.error("Error al asignar:", err);
      toast.error(err.message || "No se pudo asignar a la cabaña.");
    } finally {
      setProcesandoId(null);
    }
  };

  // Crear nuevo campamentero o líder y asignarlo directamente a esta cabaña
  const handleCrearNuevo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoForm.primer_nombre.trim() || !nuevoForm.primer_apellido.trim()) {
      toast.error("El primer nombre y primer apellido son obligatorios.");
      return;
    }

    const parsedEdad = parseInt(nuevoForm.edad, 10);
    if (isNaN(parsedEdad) || parsedEdad <= 0) {
      toast.error("Por favor ingresa una edad válida en años.");
      return;
    }

    setCreandoNuevo(true);
    try {
      const { error } = await supabase.from("inscripciones").insert([
        {
          primer_nombre: nuevoForm.primer_nombre.trim(),
          segundo_nombre: nuevoForm.segundo_nombre.trim() || null,
          primer_apellido: nuevoForm.primer_apellido.trim(),
          segundo_apellido: nuevoForm.segundo_apellido.trim() || null,
          genero: nuevoForm.genero,
          edad: parsedEdad,
          fecha_nacimiento: nuevoForm.fecha_nacimiento || null,
          celular: nuevoForm.celular.trim() || null,
          tipo_documento: nuevoForm.numero_documento.trim() ? nuevoForm.tipo_documento : null,
          numero_documento: nuevoForm.numero_documento.trim() || null,
          es_lider: nuevoForm.es_lider,
          es_boanerges: nuevoForm.es_boanerges,
          es_exclusion: nuevoForm.es_exclusion,
          cabana_id: cabanaActiva.id,
          nacionalidad: "Salvadoreña",
          contacto1_nombres: "Por definir",
          contacto1_apellidos: "Por definir",
          contacto1_relacion: "Familiar",
          contacto1_telefono: nuevoForm.celular.trim() || "00000000",
          emergencia_nombres: "Por definir",
          emergencia_apellidos: "Por definir",
          emergencia_telefono: nuevoForm.celular.trim() || "00000000",
          emergencia_relacion: "Familiar",
          declarante_nombre: `${nuevoForm.primer_nombre} ${nuevoForm.primer_apellido}`,
          declarante_dui: nuevoForm.numero_documento.trim() || "00000000-0",
          acepta_terminos: true,
          firma_url: "creado-manual-admin",
        },
      ]);

      if (error) throw error;

      toast.success(
        `${nuevoForm.primer_nombre} ${nuevoForm.primer_apellido} registrado y asignado a "${cabanaActiva.nombre}".`
      );

      // Limpiar formulario y cambiar a pestaña de ocupantes
      setNuevoForm({
        primer_nombre: "",
        segundo_nombre: "",
        primer_apellido: "",
        segundo_apellido: "",
        genero: cabanaActiva.genero.toLowerCase().startsWith("m") ? "Masculino" : "Femenino",
        edad: "",
        fecha_nacimiento: "",
        celular: "",
        tipo_documento: "DUI",
        numero_documento: "",
        es_lider: false,
        es_boanerges: Boolean(cabanaActiva.solo_boanerges),
        es_exclusion: false,
      });

      setTab("ocupantes");
      await onDataChanged();
    } catch (err: any) {
      console.error("Error al registrar y asignar:", err);
      toast.error(err.message || "No se pudo registrar la inscripción.");
    } finally {
      setCreandoNuevo(false);
    }
  };

  // Desasignar persona de la cabaña
  const handleDesasignar = (persona: CampamenteroResumen) => {
    setPersonaParaDesasignar(persona);
  };

  const handleConfirmarDesasignar = async () => {
    if (!personaParaDesasignar) return;
    const persona = personaParaDesasignar;
    const nombre = `${persona.primer_nombre} ${persona.primer_apellido}`;

    setProcesandoId(persona.id);
    try {
      const { error } = await supabase
        .from("inscripciones")
        .update({ cabana_id: null })
        .eq("id", persona.id);

      if (error) throw error;

      toast.success(`${nombre} desasignado(a) de ${cabanaActiva.nombre}.`);
      setPersonaParaDesasignar(null);
      await onDataChanged();
    } catch (err: any) {
      console.error("Error al desasignar:", err);
      toast.error(err.message || "No se pudo desasignar de la cabaña.");
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-border overflow-hidden flex flex-col h-[90vh] max-h-[850px]">
        
        {/* =========================================================
            HEADER DEL MODAL: CABAÑA DESTINO Y DETALLES
            ========================================================= */}
        <div className={`p-5 border-b flex-shrink-0 transition-colors ${
          esMasculina 
            ? "bg-blue-50/90 border-blue-200" 
            : "bg-pink-50/90 border-pink-200"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                esMasculina ? "bg-blue-600 text-white shadow-sm" : "bg-pink-600 text-white shadow-sm"
              }`}>
                <Tent className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Selector rápido de cabaña */}
                  <select
                    value={cabanaActiva?.id || cabanaSeleccionadaId}
                    onChange={(e) => setCabanaSeleccionadaId(e.target.value)}
                    className="font-black text-lg sm:text-xl font-['Outfit',sans-serif] bg-white text-foreground border border-border rounded-xl px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-2xs"
                  >
                    {todasLasCabanas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>

                  {esExclusivaBoanerges && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                      <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                      Solo Boanerges
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span>Capacidad: <strong className="text-foreground">{cabanaActiva.capacidad} camas</strong></span>
                  <span>·</span>
                  <span>Ocupados: <strong className="text-foreground">{ocupadosCount}</strong></span>
                  <span>·</span>
                  <span className={`font-bold ${libresCount === 0 ? "text-red-600" : "text-emerald-700"}`}>
                    {libresCount === 0 ? "Cabaña llena" : `${libresCount} cama(s) libre(s)`}
                  </span>
                  {lideresExcluidosActuales.length > 0 && (
                    <span className="text-amber-800 font-semibold">
                      (+{lideresExcluidosActuales.length} líder sin cama)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Selector de Pestañas: Disponibles VS Ocupantes */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/60">
            <button
              type="button"
              onClick={() => setTab("disponibles")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                tab === "disponibles"
                  ? "bg-white text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserPlus className="w-4 h-4 text-primary" />
              Asignar Personas Disponibles
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-black">
                {candidatosFiltrados.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab("ocupantes")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                tab === "ocupantes"
                  ? "bg-white text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4 text-secondary" />
              Ocupantes Actuales de esta Cabaña
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-secondary/15 text-secondary font-black">
                {ocupantesActuales.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTab("nuevo")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                tab === "nuevo"
                  ? "bg-white text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              Registrar Nuevo y Asignar
            </button>
          </div>
        </div>

        {/* =========================================================
            PESTAÑA 1: ASIGNAR PERSONAS DISPONIBLES
            ========================================================= */}
        {tab === "disponibles" && (
          <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
            
            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              
              {/* Input de Búsqueda */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, DUI/Pasaporte o celular..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-9 pr-9 py-2 text-xs border border-border rounded-xl bg-muted/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Botones de Subfiltro */}
              <div className="inline-flex rounded-xl p-1 bg-muted/40 border border-border text-xs flex-wrap">
                <button
                  type="button"
                  onClick={() => setSubFiltro("todos")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    subFiltro === "todos" ? "bg-white text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Todos ({conteoDisponibles.todos})
                </button>
                <button
                  type="button"
                  onClick={() => setSubFiltro("lideres")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    subFiltro === "lideres" ? "bg-amber-100 text-amber-900 shadow-2xs" : "text-muted-foreground hover:text-amber-800"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Líderes ({conteoDisponibles.lideres})
                </button>
                <button
                  type="button"
                  onClick={() => setSubFiltro("boanerges")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    subFiltro === "boanerges" ? "bg-emerald-100 text-emerald-900 shadow-2xs" : "text-muted-foreground hover:text-emerald-800"
                  }`}
                >
                  <Zap className="w-3 h-3 text-emerald-600" />
                  Boanerges ({conteoDisponibles.boanerges})
                </button>
                <button
                  type="button"
                  onClick={() => setSubFiltro("reasignables")}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    subFiltro === "reasignables" ? "bg-purple-100 text-purple-900 shadow-2xs" : "text-muted-foreground hover:text-purple-800"
                  }`}
                  title="Permite mover a personas que ya tienen otra cabaña a esta"
                >
                  Mover de otra cabaña ({conteoDisponibles.reasignables})
                </button>
              </div>
            </div>

            {/* Aviso si la cabaña es exclusiva de Boanerges */}
            {esExclusivaBoanerges && (
              <div className="flex items-center justify-end text-xs text-muted-foreground px-1">
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-emerald-600" />
                  Esta cabaña requiere el distintivo Boanerges
                </span>
              </div>
            )}

            {/* Lista de Personas Disponibles */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {candidatosFiltrados.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed border-border">
                  <Users className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  <p className="font-bold text-xs text-foreground">No hay personas disponibles con estos criterios.</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {subFiltro === "lideres"
                      ? "Todos los líderes de este género ya tienen cabaña asignada."
                      : subFiltro === "boanerges"
                      ? "No hay campamenteros Boanerges sin asignar para este género."
                      : "No hay inscripciones activas (o líderes) sin cabaña para este género."}
                  </p>
                  {subFiltro === "lideres" && conteoDisponibles.reasignables > 0 && (
                    <button
                      type="button"
                      onClick={() => setSubFiltro("reasignables")}
                      className="mt-3 px-3.5 py-1.5 text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>Ver líderes en otras cabañas ({conteoDisponibles.reasignables} disponibles para mover)</span>
                    </button>
                  )}
                </div>
              ) : (
                candidatosFiltrados.map((persona) => {
                  const nombreCompleto = `${persona.primer_nombre} ${persona.segundo_nombre || ""} ${persona.primer_apellido} ${persona.segundo_apellido || ""}`.replace(/\s+/g, " ").trim();
                  const noCumpleBoanerges = esExclusivaBoanerges && !persona.es_boanerges && !persona.es_lider;
                  const esCandidatoLider = persona.es_lider;
                  const isProcessing = procesandoId === persona.id;

                  return (
                    <div
                      key={persona.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        noCumpleBoanerges
                          ? "bg-rose-50/40 border-rose-200/80 hover:bg-rose-50"
                          : esCandidatoLider
                          ? "bg-amber-50/50 border-amber-200/80 hover:bg-amber-50"
                          : "bg-white border-border hover:border-primary/40 hover:shadow-2xs"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-foreground">
                            {nombreCompleto}
                          </span>

                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            persona.genero?.toLowerCase().startsWith("masc")
                              ? "bg-blue-100 text-blue-700"
                              : "bg-pink-100 text-pink-700"
                          }`}>
                            {persona.genero}
                          </span>

                          {persona.es_lider && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                              Líder
                            </span>
                          )}

                          {persona.es_boanerges && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5 text-emerald-700" />
                              Boanerges
                            </span>
                          )}

                          {persona.es_exclusion && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                              Exclusión (No ocupa cama)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          {persona.numero_documento && (
                            <span className="text-[11px] font-medium flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              {persona.tipo_documento ? `${persona.tipo_documento}: ` : ""}{persona.numero_documento}
                            </span>
                          )}

                          {persona.celular && (
                            <span className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {persona.celular}
                            </span>
                          )}

                          {persona.cabana_id && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              Actualmente en otra cabaña
                            </span>
                          )}
                        </div>

                        {noCumpleBoanerges && (
                          <p className="text-[10px] text-rose-700 font-bold mt-1">
                            ⚠️ Advertencia: Esta cabaña requiere Boanerges. No se recomienda asignar a esta persona.
                          </p>
                        )}
                      </div>

                      {/* Botón Asignar */}
                      <div className="flex-shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleAsignar(persona)}
                          disabled={isProcessing}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 ${
                            noCumpleBoanerges
                              ? "bg-rose-600 hover:bg-rose-700 text-white"
                              : "bg-primary hover:bg-primary/90 text-white"
                          }`}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Asignando...
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              Asignar a {cabanaActiva.nombre}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            PESTAÑA 2: OCUPANTES ACTUALES DE ESTA CABAÑA
            ========================================================= */}
        {tab === "ocupantes" && (
          <div className="flex-1 flex flex-col overflow-hidden p-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-2">
              <span className="font-semibold">
                Integrantes asignados a <strong>{cabanaActiva.nombre}</strong> ({ocupantesActuales.length} en total)
              </span>
              <span className="text-[11px]">
                {ocupadosCount} de {cabanaActiva.capacidad} camas físicas ocupadas
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {ocupantesActuales.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-slate-50/50 rounded-2xl border border-dashed border-border">
                  <BedDouble className="w-10 h-10 text-muted-foreground/30 mb-2" />
                  <p className="font-bold text-xs text-foreground">Esta cabaña aún no tiene ningún ocupante asignado.</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Usa la pestaña "Asignar Personas Disponibles" para añadir líderes o campamenteros.
                  </p>
                </div>
              ) : (
                ocupantesActuales.map((persona, index) => {
                  const nombreCompleto = `${persona.primer_nombre} ${persona.segundo_nombre || ""} ${persona.primer_apellido} ${persona.segundo_apellido || ""}`.replace(/\s+/g, " ").trim();
                  const isProcessing = procesandoId === persona.id;
                  const esLider = persona.es_lider;
                  const esExclusion = persona.es_exclusion;

                  return (
                    <div
                      key={persona.id}
                      className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        esLider
                          ? "bg-amber-50/70 border-amber-200/80"
                          : "bg-white border-border"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                            esLider ? "bg-amber-200 text-amber-900" : "bg-slate-200 text-slate-800"
                          }`}>
                            {index + 1}
                          </span>

                          <span className="font-bold text-xs sm:text-sm text-foreground">
                            {nombreCompleto}
                          </span>

                          {esLider && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30">
                              Líder
                            </span>
                          )}

                          {esExclusion && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                              No ocupa cama
                            </span>
                          )}

                          {persona.es_boanerges && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                              Boanerges
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                          {persona.numero_documento && (
                            <span className="text-[11px] font-medium flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              {persona.tipo_documento ? `${persona.tipo_documento}: ` : ""}{persona.numero_documento}
                            </span>
                          )}

                          {persona.celular && (
                            <span className="text-[11px] font-medium flex items-center gap-1 text-muted-foreground">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {persona.celular}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Acciones de Ocupante (Mover y Desasignar) */}
                      <div className="flex-shrink-0 self-end sm:self-center flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setPersonaParaMover(persona);
                            setMoverModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Mover a otra cabaña"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Mover
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDesasignar(persona)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Quitar de esta cabaña y dejar libre"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="w-3.5 h-3.5" />
                          )}
                          Desasignar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            PESTAÑA 3: REGISTRAR NUEVO CAMPAMENTERO O LÍDER Y ASIGNAR
            ========================================================= */}
        {tab === "nuevo" && (
          <form onSubmit={handleCrearNuevo} className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
              <Plus className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block">Inscribir Directamente en {cabanaActiva.nombre}</strong>
                <span>
                  Registra un campamentero o líder en el sistema y quedará asignado de inmediato a esta cabaña.
                  {libresCount <= 0 && " (Se registrará en modalidad de sobregiro para no dejar a nadie fuera)."}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Primer Nombre *</label>
                <input
                  type="text"
                  required
                  value={nuevoForm.primer_nombre}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, primer_nombre: e.target.value })}
                  placeholder="Ej: Daniel"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Segundo Nombre</label>
                <input
                  type="text"
                  value={nuevoForm.segundo_nombre}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, segundo_nombre: e.target.value })}
                  placeholder="Ej: José"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Primer Apellido *</label>
                <input
                  type="text"
                  required
                  value={nuevoForm.primer_apellido}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, primer_apellido: e.target.value })}
                  placeholder="Ej: Urrita"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Segundo Apellido</label>
                <input
                  type="text"
                  value={nuevoForm.segundo_apellido}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, segundo_apellido: e.target.value })}
                  placeholder="Ej: Henríquez"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Género *</label>
                <select
                  value={nuevoForm.genero}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, genero: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold cursor-pointer"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Edad (en años) *</label>
                <input
                  type="number"
                  required
                  min={5}
                  max={99}
                  value={nuevoForm.edad}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, edad: e.target.value })}
                  placeholder="Ej: 15"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={nuevoForm.fecha_nacimiento}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, fecha_nacimiento: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Celular / Teléfono</label>
                <input
                  type="tel"
                  value={nuevoForm.celular}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, celular: e.target.value })}
                  placeholder="7890-1234"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Tipo de Documento</label>
                <select
                  value={nuevoForm.tipo_documento}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, tipo_documento: e.target.value as "DUI" | "PASAPORTE" })}
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="DUI">DUI</option>
                  <option value="PASAPORTE">PASAPORTE</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Número de Documento</label>
                <input
                  type="text"
                  value={nuevoForm.numero_documento}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, numero_documento: e.target.value })}
                  placeholder="01234567-8"
                  className="w-full px-3 py-2 text-xs border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            </div>

            {/* Checkboxes de rol y condiciones especiales */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-border space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Condición y Rol Especial:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-border cursor-pointer hover:border-primary/50">
                  <input
                    type="checkbox"
                    checked={nuevoForm.es_lider}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, es_lider: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold block text-xs">¿Es Líder?</span>
                    <span className="text-[10px] text-muted-foreground">Responsable de cabaña</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-border cursor-pointer hover:border-primary/50">
                  <input
                    type="checkbox"
                    checked={nuevoForm.es_boanerges}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, es_boanerges: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold block text-xs">¿Es Boanerges?</span>
                    <span className="text-[10px] text-muted-foreground">Distintivo Boanerges</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-border cursor-pointer hover:border-primary/50">
                  <input
                    type="checkbox"
                    checked={nuevoForm.es_exclusion}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, es_exclusion: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <div>
                    <span className="font-bold block text-xs">Exclusión de Cama</span>
                    <span className="text-[10px] text-muted-foreground">No consume cama física</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={creandoNuevo}
                className="px-5 py-2.5 text-xs font-black text-white bg-primary hover:bg-primary/90 active:scale-95 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {creandoNuevo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando y asignando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Registrar y Asignar a {cabanaActiva.nombre}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="p-4 border-t border-border bg-slate-50 flex items-center justify-between text-xs text-muted-foreground flex-shrink-0">
          <span>
            {cabanaActiva.nombre} ({cabanaActiva.genero})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-foreground bg-white border border-border hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>

      {/* Modal para Mover a otra cabaña */}
      <MoverCampamenteroModal
        isOpen={moverModalOpen}
        persona={personaParaMover}
        cabanaActual={cabanaActiva}
        todasLasCabanas={todasLasCabanas}
        campamenteros={campamenteros}
        onClose={() => setMoverModalOpen(false)}
        onSuccess={async () => {
          await onDataChanged();
        }}
      />

      {/* Modal de confirmación para quitar de cabaña */}
      {personaParaDesasignar && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !procesandoId && setPersonaParaDesasignar(null)}
        >
          <div 
            className="bg-white rounded-3xl border border-border shadow-2xl max-w-sm w-full p-6 text-center space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-2xs">
              <UserMinus className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black font-['Outfit',sans-serif] text-foreground">
                ¿Quitar de la cabaña?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ¿Deseas remover a <strong className="text-foreground">{personaParaDesasignar.primer_nombre} {personaParaDesasignar.primer_apellido}</strong> de la cabaña <strong className="text-foreground">{cabanaActiva.nombre}</strong>?
              </p>
              <p className="text-[11px] text-muted-foreground/80 bg-muted/40 p-2.5 rounded-xl border border-border/60">
                La persona <strong>no se borrará</strong> del campamento, únicamente quedará sin cabaña asignada para reubicarla.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPersonaParaDesasignar(null)}
                disabled={Boolean(procesandoId)}
                className="px-4 py-2 text-xs font-bold text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors cursor-pointer flex-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarDesasignar}
                disabled={Boolean(procesandoId)}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {procesandoId ? (
                  <span>Quitando...</span>
                ) : (
                  <>
                    <UserMinus className="w-4 h-4" />
                    <span>Quitar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
