import { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Search, Tent, Bus, 
  Sparkles, RefreshCw, LogOut, ChevronLeft, ChevronRight,
  BedDouble, LayoutGrid, Table as TableIcon, Plus,
  CreditCard, Phone, Zap, Pencil, UserPlus, UserMinus, CheckCircle2,
  ArrowRightLeft, AlertTriangle, X, FileSpreadsheet, UserX, User,
  UserCheck, Loader2
} from "lucide-react";
import { supabase } from "../../utils/supabase";
import { AdminUser } from "../App";
import bannerImg from "../../imports/MONTE WEB-12.png";
import { esCabanaExclusivaBoanerges } from "../../utils/constants";
import CabanaModal from "./CabanaModal";
import AsignacionManualModal from "./AsignacionManualModal";
import AsignarCabanasModal from "./AsignarCabanasModal";
import MoverCampamenteroModal from "./MoverCampamenteroModal";
import { exportarCabanasExcel } from "../../utils/exportarCabanasExcel";
import { useConfiguracionEvento } from "../../hooks/useConfiguracionEvento";
import { toast } from "sonner";

export interface Cabana {
  id: string;
  nombre: string;
  genero: string;
  capacidad: number;
  cantidad_lideres: number;
  bus: string | null;
  solo_boanerges?: boolean | null;
}

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

function normalizarTexto(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve tildes y diacríticos
    .trim();
}

function personaCoincideConBusqueda(persona: CampamenteroResumen, query: string): boolean {
  const q = normalizarTexto(query);
  if (!q) return true;

  // Separar en palabras/tokens (permite "marvin henriquez", "henriquez marvin", etc.)
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const nombresYApellidos = `${persona.primer_nombre || ""} ${persona.segundo_nombre || ""} ${persona.primer_apellido || ""} ${persona.segundo_apellido || ""}`;
  const textoCompleto = normalizarTexto(`${nombresYApellidos} ${persona.numero_documento || ""}`);
  const docLimpio = (persona.numero_documento || "").replace(/[^0-9a-z]/gi, "").toLowerCase();

  return tokens.every((token) => {
    const tokenLimpio = token.replace(/[^0-9a-z]/gi, "").toLowerCase();
    const coincideTexto = textoCompleto.includes(token);
    const coincideDoc = tokenLimpio.length >= 3 && docLimpio.includes(tokenLimpio);
    return coincideTexto || coincideDoc;
  });
}

function cabanaCoincideConBusqueda(cabana: Cabana, query: string): boolean {
  const q = normalizarTexto(query);
  if (!q) return true;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const textoCabana = normalizarTexto(`${cabana.nombre || ""} ${cabana.bus || ""}`);
  return tokens.every((token) => textoCabana.includes(token));
}

interface Props {
  onBack: () => void;
  onLogout: () => void;
  adminUser: AdminUser;
}

export default function DistribucionCabanas({ onBack, onLogout, adminUser }: Props) {
  const { config } = useConfiguracionEvento();
  const [cabanas, setCabanas] = useState<Cabana[]>([]);
  const [campamenteros, setCampamenteros] = useState<CampamenteroResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y Visualización
  const [busFiltro, setBusFiltro] = useState<string>("todos");
  const [generoFiltro, setGeneroFiltro] = useState<string>("todos");
  const [busqueda, setBusqueda] = useState<string>("");
  const [modoBusqueda, setModoBusqueda] = useState<"cabana" | "persona">("cabana");
  const [vista, setVista] = useState<"cuadricula" | "tabla">("cuadricula");

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState<number>(6); // 6 cabañas por página

  // Modales
  const [cabanaModalOpen, setCabanaModalOpen] = useState(false);
  const [cabanaParaEditar, setCabanaParaEditar] = useState<Cabana | null>(null);

  const [asignacionModalOpen, setAsignacionModalOpen] = useState(false);
  const [cabanaParaAsignar, setCabanaParaAsignar] = useState<Cabana | null>(null);

  const [asignarAutoModalOpen, setAsignarAutoModalOpen] = useState(false);

  // Modal para mover a otra cabaña
  const [moverModalOpen, setMoverModalOpen] = useState(false);
  const [personaParaMover, setPersonaParaMover] = useState<CampamenteroResumen | null>(null);
  const [cabanaDePersonaParaMover, setCabanaDePersonaParaMover] = useState<Cabana | null>(null);

  // Modal para confirmar quitar de cabaña
  const [personaParaDesasignar, setPersonaParaDesasignar] = useState<{
    persona: CampamenteroResumen;
    cabanaNombre: string;
  } | null>(null);
  const [desasignando, setDesasignando] = useState(false);

  const handleAbrirMover = (persona: CampamenteroResumen, cabana: Cabana) => {
    setPersonaParaMover(persona);
    setCabanaDePersonaParaMover(cabana);
    setMoverModalOpen(true);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Obtener catálogo de cabañas
      const { data: cabanasData, error: cabErr } = await supabase
        .from("cabanas")
        .select("*")
        .order("nombre", { ascending: true });

      if (cabErr) throw cabErr;

      // 2. Obtener inscripciones
      const { data: inscData, error: inscErr } = await supabase
        .from("inscripciones")
        .select("*");

      if (inscErr) {
        console.warn("No se pudieron cargar inscripciones vinculadas:", inscErr.message);
      }

      setCabanas(cabanasData || []);
      setCampamenteros(inscData || []);
    } catch (err: any) {
      console.error("Error al cargar cabañas:", err);
      setError(err.message || "No se pudo cargar la información de las cabañas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reiniciar a página 1 cuando cambia algún filtro
  useEffect(() => {
    setPaginaActual(1);
  }, [generoFiltro, busFiltro, busqueda, modoBusqueda, porPagina]);

  // Mapa de ocupación por cabaña (ID de cabaña -> lista de integrantes)
  const ocupacionPorCabana = useMemo(() => {
    const mapa: Record<string, CampamenteroResumen[]> = {};
    for (const c of cabanas) {
      mapa[c.id] = [];
    }
    for (const p of campamenteros) {
      if (p.cabana_id && mapa[p.cabana_id]) {
        mapa[p.cabana_id].push(p);
      }
    }
    return mapa;
  }, [cabanas, campamenteros]);

  // Lista única de buses para el filtro
  const listaBuses = useMemo(() => {
    const busesSet = new Set<string>();
    for (const c of cabanas) {
      if (c.bus) busesSet.add(c.bus);
    }
    return Array.from(busesSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [cabanas]);

  // Filtrado de cabañas
  const cabanasFiltradas = useMemo(() => {
    return cabanas.filter((c) => {
      if (generoFiltro === "Masculino" && !c.genero.toLowerCase().startsWith("masc")) return false;
      if (generoFiltro === "Femenino" && !c.genero.toLowerCase().startsWith("fem")) return false;

      if (busFiltro !== "todos" && c.bus !== busFiltro) return false;

      if (busqueda.trim()) {
        const coincideCabana = cabanaCoincideConBusqueda(c, busqueda);
        const integrantes = ocupacionPorCabana[c.id] || [];
        const coincidePersonas = integrantes.some((p) => personaCoincideConBusqueda(p, busqueda));

        if (modoBusqueda === "cabana") {
          if (!coincideCabana) return false;
        } else {
          // "persona"
          if (!coincidePersonas) return false;
        }
      }

      return true;
    });
  }, [cabanas, generoFiltro, busFiltro, busqueda, modoBusqueda, ocupacionPorCabana]);

  // Personas que coinciden con la búsqueda (en cualquier cabaña o sin cabaña)
  const personasCoincidentes = useMemo(() => {
    if (!busqueda.trim() || modoBusqueda === "cabana") return [];
    return campamenteros.filter((p) => {
      const esElegible = p.tipo_pago !== null || Boolean(p.es_lider);
      return esElegible && personaCoincideConBusqueda(p, busqueda);
    });
  }, [campamenteros, busqueda, modoBusqueda]);

  // Personas que coinciden con la búsqueda pero que NO tienen cabaña asignada aún
  const personasSinCabanaCoincidentes = useMemo(() => {
    return personasCoincidentes.filter((p) => !p.cabana_id);
  }, [personasCoincidentes]);

  // Paginación calculada
  const totalPaginas = Math.ceil(cabanasFiltradas.length / (porPagina || 1)) || 1;
  const cabanasPaginadas = useMemo(() => {
    if (porPagina === 0) return cabanasFiltradas; // Todas
    const inicio = (paginaActual - 1) * porPagina;
    return cabanasFiltradas.slice(inicio, inicio + porPagina);
  }, [cabanasFiltradas, paginaActual, porPagina]);

  // Métricas generales
  const metricas = useMemo(() => {
    const totalCabanas = cabanas.length;
    const totalCapacidad = cabanas.reduce((sum, c) => sum + (c.capacidad || 0), 0);
    const totalLideres = cabanas.reduce((sum, c) => sum + (c.cantidad_lideres || 0), 0);

    const cabanaMap = new Map(cabanas.map((c) => [c.id, c]));

    const capacidadMasc = cabanas
      .filter((c) => c.genero.toLowerCase().startsWith("masc"))
      .reduce((sum, c) => sum + (c.capacidad || 0), 0);
    const capacidadFem = cabanas
      .filter((c) => c.genero.toLowerCase().startsWith("fem"))
      .reduce((sum, c) => sum + (c.capacidad || 0), 0);

    let ocupadosMasc = 0;
    let ocupadosFem = 0;
    let lideresAsignados = 0;

    for (const p of campamenteros) {
      if (p.cabana_id) {
        if (p.es_lider) lideresAsignados++;
        // Solo cuentan como ocupantes de cama quienes duermen en cabaña (!es_exclusion)
        if (!p.es_exclusion) {
          const cab = cabanaMap.get(p.cabana_id);
          if (cab) {
            if (cab.genero.toLowerCase().startsWith("masc")) {
              ocupadosMasc++;
            } else {
              ocupadosFem++;
            }
          }
        }
      }
    }

    const asignados = ocupadosMasc + ocupadosFem;
    const disponibles = Math.max(0, totalCapacidad - asignados);
    const libresMasc = Math.max(0, capacidadMasc - ocupadosMasc);
    const libresFem = Math.max(0, capacidadFem - ocupadosFem);
    const totalExcluidos = campamenteros.filter((p) => p.cabana_id && p.es_exclusion).length;

    const porcentajeOcupado = totalCapacidad > 0 ? Math.round((asignados / totalCapacidad) * 100) : 0;
    const porcentajeLibre = totalCapacidad > 0 ? Math.round((disponibles / totalCapacidad) * 100) : 0;

    // Campamenteros inscritos activos sin cabaña asignada
    const sinCabanaList = campamenteros.filter((p) => {
      const esElegible = p.tipo_pago !== null || Boolean(p.es_lider);
      return esElegible && !p.cabana_id;
    });
    const sinCabanaTotal = sinCabanaList.length;
    const sinCabanaMasc = sinCabanaList.filter((p) => p.genero?.toLowerCase().startsWith("masc")).length;
    const sinCabanaFem = sinCabanaList.filter((p) => p.genero?.toLowerCase().startsWith("fem")).length;

    // Campamenteros activos con distintivo Boanerges
    const boanergesList = campamenteros.filter((p) => {
      const esElegible = p.tipo_pago !== null || Boolean(p.es_lider);
      const esBoan = Boolean(p.es_boanerges || (p as any).es_boanergues);
      return esElegible && esBoan;
    });
    const boanergesTotal = boanergesList.length;
    const boanergesMasc = boanergesList.filter((p) => p.genero?.toLowerCase().startsWith("masc")).length;
    const boanergesFem = boanergesList.filter((p) => p.genero?.toLowerCase().startsWith("fem")).length;

    return { 
      totalCabanas, 
      totalCapacidad, 
      totalLideres, 
      lideresAsignados,
      asignados, 
      disponibles, 
      totalExcluidos,
      capacidadMasc,
      capacidadFem,
      ocupadosMasc,
      ocupadosFem,
      libresMasc,
      libresFem,
      porcentajeOcupado,
      porcentajeLibre,
      sinCabanaTotal,
      sinCabanaMasc,
      sinCabanaFem,
      boanergesTotal,
      boanergesMasc,
      boanergesFem,
    };
  }, [cabanas, campamenteros]);

  // Handlers para Modales
  const handleNuevaCabana = () => {
    setCabanaParaEditar(null);
    setCabanaModalOpen(true);
  };

  const handleEditarCabana = (cabana: Cabana) => {
    setCabanaParaEditar(cabana);
    setCabanaModalOpen(true);
  };

  const handleAbrirAsignacion = (cabana: Cabana) => {
    setCabanaParaAsignar(cabana);
    setAsignacionModalOpen(true);
  };

  const handleDesasignarRapido = (persona: CampamenteroResumen, cabanaNombre: string) => {
    setPersonaParaDesasignar({ persona, cabanaNombre });
  };

  const handleConfirmarDesasignar = async () => {
    if (!personaParaDesasignar) return;
    const { persona, cabanaNombre } = personaParaDesasignar;
    const nombre = `${persona.primer_nombre} ${persona.primer_apellido}`;
    setDesasignando(true);

    try {
      const { error } = await supabase
        .from("inscripciones")
        .update({ cabana_id: null })
        .eq("id", persona.id);

      if (error) throw error;
      toast.success(`${nombre} quitado(a) de ${cabanaNombre} correctamente.`);
      setPersonaParaDesasignar(null);
      fetchData();
    } catch (err: any) {
      console.error("Error al desasignar:", err);
      toast.error(err.message || "Error al quitar de la cabaña.");
    } finally {
      setDesasignando(false);
    }
  };

  const [exportando, setExportando] = useState(false);

  const handleExportarExcel = async () => {
    if (cabanas.length === 0) {
      toast.error("No hay cabañas para exportar.");
      return;
    }
    setExportando(true);
    try {
      await exportarCabanasExcel(cabanas, campamenteros, config.nombreEvento);
      toast.success("Archivo Excel exportado con éxito.");
    } catch (err: any) {
      console.error("Error al exportar cabañas:", err);
      toast.error("Error al generar el archivo Excel: " + (err.message || "desconocido"));
    } finally {
      setExportando(false);
    }
  };

  // Validación estricta: Únicamente usuarios con rol 'admin' pueden ingresar a este módulo
  if (adminUser.rol !== "admin") {
    return (
      <div className="min-h-screen bg-[#f3f6f4] font-['Inter',sans-serif] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl border border-border shadow-xl max-w-md w-full space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-foreground font-['Outfit',sans-serif]">
            Acceso Exclusivo de Administrador
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            No tienes los permisos necesarios para acceder a este módulo. La Distribución de Cabañas es exclusiva para administradores del sistema.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2.5 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6f4] font-['Inter',sans-serif] flex flex-col justify-between">
      {/* Header Banner */}
      <header className="w-full relative overflow-hidden shadow-sm bg-primary/20" style={{ height: "120px" }}>
        <img
          src={bannerImg}
          alt="Monte Sion 2026 - Taber x Jev"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute top-3 right-4 z-20 flex items-center gap-2">
          <button
            onClick={onLogout}
            className="px-3.5 py-1.5 bg-white/90 hover:bg-white active:bg-white/80 backdrop-blur-md text-red-600 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-white/60 hover:scale-105"
            title="Cerrar sesión"
          >
            Logout
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        
        {/* Barra superior de navegación y título */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 bg-white hover:bg-muted text-foreground rounded-xl border border-border shadow-xs transition-colors cursor-pointer"
                title="Volver al inicio"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-foreground font-['Outfit',sans-serif] tracking-tight">
                  Distribución de Cabañas
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vista panorámica de camas, campamenteros asignados y gestión de cabañas
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Botón de Asignación Automática (Exclusivo Administradores) */}
            {adminUser.rol === "admin" && (
              <button
                type="button"
                onClick={() => setAsignarAutoModalOpen(true)}
                className="px-3.5 py-2 text-xs font-black bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-md hover:scale-105 active:scale-95 border border-emerald-500/30"
                title="Asignación automática y balanceada de cabañas (Exclusivo Administrador)"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                Asignar Cabañas
              </button>
            )}

            {/* Botón "+ Nueva Cabaña" */}
            <button
              type="button"
              onClick={handleNuevaCabana}
              className="px-3.5 py-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nueva Cabaña
            </button>

            {/* Botón "Exportar" a Excel */}
            <button
              type="button"
              onClick={handleExportarExcel}
              disabled={exportando || loading}
              className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
              title="Descargar libro de Excel con todas las cabañas en hojas individuales"
            >
              <FileSpreadsheet className={`w-4 h-4 text-emerald-100 ${exportando ? "animate-pulse" : ""}`} />
              {exportando ? "Exportando..." : "Exportar"}
            </button>

            <button
              onClick={fetchData}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-bold bg-white hover:bg-muted text-foreground border border-border rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-primary" : ""}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4">
          {/* 1. Cabañas */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Tent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">Cabañas</span>
              <span className="text-xl sm:text-2xl font-black text-foreground font-['Outfit',sans-serif]">
                {metricas.totalCabanas}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {cabanas.filter(c => c.genero.toLowerCase().startsWith("masc")).length} Masc. · {cabanas.filter(c => c.genero.toLowerCase().startsWith("fem")).length} Fem.
              </span>
            </div>
          </div>

          {/* 2. Capacidad */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-500/10 text-slate-700 flex items-center justify-center flex-shrink-0">
              <BedDouble className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">Capacidad</span>
              <span className="text-xl sm:text-2xl font-black text-foreground font-['Outfit',sans-serif]">
                {metricas.totalCapacidad}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {metricas.capacidadMasc} Masc. · {metricas.capacidadFem} Fem.
              </span>
            </div>
          </div>

          {/* 3. Ocupados */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-violet-500/10 text-violet-700 flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">Ocupados</span>
              <span className="text-xl sm:text-2xl font-black text-violet-700 font-['Outfit',sans-serif]">
                {metricas.asignados}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {metricas.ocupadosMasc} Masc. · {metricas.ocupadosFem} Fem.
              </span>
            </div>
          </div>

          {/* 4. Libres */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">Libres</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 font-['Outfit',sans-serif]">
                {metricas.disponibles}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {metricas.libresMasc} Masc. · {metricas.libresFem} Fem.
              </span>
            </div>
          </div>

          {/* 5. Sin Cabaña */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center flex-shrink-0">
              <UserX className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">Sin Cabaña</span>
              <span className="text-xl sm:text-2xl font-black text-rose-600 font-['Outfit',sans-serif]">
                {metricas.sinCabanaTotal}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {metricas.sinCabanaMasc} Masc. · {metricas.sinCabanaFem} Fem.
              </span>
            </div>
          </div>

          {/* 6. Boanerges */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">Boanerges</span>
              <span className="text-xl sm:text-2xl font-black text-teal-700 font-['Outfit',sans-serif]">
                {metricas.boanergesTotal}
              </span>
            </div>
          </div>

          {/* 7. Líderes */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">Líderes</span>
              <span className="text-xl sm:text-2xl font-black text-foreground font-['Outfit',sans-serif]">
                {metricas.totalLideres}
              </span>
            </div>
          </div>

          {/* 8. Buses */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-border shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center flex-shrink-0">
              <Bus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">Buses</span>
              <span className="text-xl sm:text-2xl font-black text-foreground font-['Outfit',sans-serif]">
                {listaBuses.length}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros, Búsqueda y Paginación Controls */}
        <div className="bg-white p-4 rounded-2xl border border-border shadow-xs flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 min-w-0">
            {/* Switch / Segmented Control de Modo de Búsqueda */}
            <div className="inline-flex rounded-xl p-1 bg-muted/40 border border-border flex-shrink-0">
              <button
                type="button"
                onClick={() => setModoBusqueda("cabana")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  modoBusqueda === "cabana" 
                    ? "bg-white text-foreground shadow-xs" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Filtrar únicamente por nombre de cabaña o bus"
              >
                <Tent className="w-3.5 h-3.5 text-primary" />
                <span>Cabaña / Bus</span>
              </button>
              <button
                type="button"
                onClick={() => setModoBusqueda("persona")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  modoBusqueda === "persona" 
                    ? "bg-white text-foreground shadow-xs" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Buscar campamenteros por nombre flexible o DUI"
              >
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Personas</span>
              </button>
            </div>

            {/* Input de Búsqueda con placeholder dinámico */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={
                  modoBusqueda === "persona"
                    ? "Buscar campamentero por nombre o DUI..."
                    : "Buscar por nombre de cabaña o # de bus..."
                }
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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro de Género */}
            <div className="inline-flex rounded-xl p-1 bg-muted/40 border border-border">
              <button
                type="button"
                onClick={() => setGeneroFiltro("todos")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  generoFiltro === "todos" ? "bg-white text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Todas ({cabanas.length})
              </button>
              <button
                type="button"
                onClick={() => setGeneroFiltro("Masculino")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  generoFiltro === "Masculino" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-blue-700"
                }`}
              >
                Masculinas ({cabanas.filter(c => c.genero.toLowerCase().startsWith("masc")).length})
              </button>
              <button
                type="button"
                onClick={() => setGeneroFiltro("Femenino")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  generoFiltro === "Femenino" ? "bg-pink-600 text-white shadow-xs" : "text-muted-foreground hover:text-pink-700"
                }`}
              >
                Femeninas ({cabanas.filter(c => c.genero.toLowerCase().startsWith("fem")).length})
              </button>
            </div>

            {/* Selector de Bus */}
            <div className="flex items-center gap-1.5">
              <Bus className="w-4 h-4 text-muted-foreground" />
              <select
                value={busFiltro}
                onChange={(e) => setBusFiltro(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-bold border border-border rounded-xl bg-white text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              >
                <option value="todos">Todos los Buses</option>
                {listaBuses.map((bus) => (
                  <option key={bus} value={bus}>{bus}</option>
                ))}
              </select>
            </div>

            {/* Selector de cantidad por página */}
            {vista === "cuadricula" && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="font-bold text-[10px] uppercase">Ver:</span>
                <select
                  value={porPagina}
                  onChange={(e) => setPorPagina(Number(e.target.value))}
                  className="px-2 py-1 text-xs font-bold border border-border rounded-lg bg-white text-foreground focus:outline-none cursor-pointer"
                >
                  <option value={4}>4 por pág</option>
                  <option value={6}>6 por pág</option>
                  <option value={8}>8 por pág</option>
                  <option value={0}>Todas ({cabanas.length})</option>
                </select>
              </div>
            )}

            {/* Selector de modo de vista */}
            <div className="inline-flex rounded-xl p-1 bg-muted/40 border border-border">
              <button
                type="button"
                onClick={() => setVista("cuadricula")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  vista === "cuadricula" 
                    ? "bg-primary text-white shadow-xs" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cabañas con Camas
              </button>
              <button
                type="button"
                onClick={() => setVista("tabla")}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  vista === "tabla" 
                    ? "bg-primary text-white shadow-xs" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                Planilla Resumen
              </button>
            </div>
          </div>
        </div>

        {/* Paginación Header si aplica */}
        {porPagina > 0 && totalPaginas > 1 && (
          <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-border shadow-xs text-xs">
            <span className="text-muted-foreground font-semibold">
              Mostrando cabañas <span className="font-bold text-foreground">{(paginaActual - 1) * porPagina + 1}</span> a{" "}
              <span className="font-bold text-foreground">{Math.min(paginaActual * porPagina, cabanasFiltradas.length)}</span> de{" "}
              <span className="font-bold text-foreground">{cabanasFiltradas.length}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="p-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPaginaActual(num)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    paginaActual === num 
                      ? "bg-primary text-white" 
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="p-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Banner: Campamenteros encontrados que aún no tienen cabaña asignada */}
        {personasSinCabanaCoincidentes.length > 0 && (
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-2xl p-4 shadow-xs space-y-3 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <UserX className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>
                  {personasSinCabanaCoincidentes.length === 1 
                    ? "1 campamentero encontrado sin cabaña asignada" 
                    : `${personasSinCabanaCoincidentes.length} campamenteros encontrados sin cabaña asignada`}
                </span>
              </div>
              <span className="text-[11px] text-amber-800 font-semibold">
                Inscripción confirmada · Pendiente de asignar dormitorio
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {personasSinCabanaCoincidentes.map((p) => {
                const nombreCompleto = `${p.primer_nombre} ${p.segundo_nombre || ""} ${p.primer_apellido} ${p.segundo_apellido || ""}`.replace(/\s+/g, " ").trim();
                const esMasc = p.genero.toLowerCase().startsWith("masc");
                return (
                  <div key={p.id} className="bg-white p-3 rounded-xl border border-amber-200/90 shadow-2xs flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-foreground truncate" title={nombreCompleto}>
                          {nombreCompleto}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full flex-shrink-0 ${
                          esMasc ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
                        }`}>
                          {p.genero}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {p.numero_documento && `DUI: ${p.numero_documento} · `}
                        {p.edad && `${p.edad} años`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAsignarAutoModalOpen(true)}
                      className="px-2.5 py-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Asignar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contenido Principal: Cuadrícula con Camas O Planilla */}
        {loading ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-semibold">Cargando distribución de cabañas...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex flex-col items-center justify-center gap-2">
            <p className="font-semibold text-sm">{error}</p>
            <button onClick={fetchData} className="mt-2 px-4 py-2 text-xs font-bold bg-primary text-white rounded-xl">
              Reintentar
            </button>
          </div>
        ) : cabanasFiltradas.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground bg-white rounded-2xl border border-border">
            <Tent className="w-12 h-12 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm font-semibold">
              {personasSinCabanaCoincidentes.length > 0 
                ? "No hay cabañas asignadas para esta persona (ver recuadro de arriba para asignar)."
                : "No se encontraron cabañas con los filtros o búsqueda seleccionada."}
            </p>
          </div>
        ) : vista === "cuadricula" ? (

          /* ===============================================================
             VISTA 1: CUADRÍCULA CON CAMAS Y ESPACIOS EN BLANCO DIRECTOS
             =============================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {cabanasPaginadas.map((cabana) => {
              const integrantes = ocupacionPorCabana[cabana.id] || [];
              // Líderes con exclusión (aparecen al inicio de la lista en fila amarilla pero no ocupan cama física)
              const excluidos = integrantes.filter((p) => p.es_exclusion);
              const lideresExcluidos = excluidos;
              // Personas que sí duermen en la cabaña (ocupan cama física)
              const durmientes = integrantes.filter((p) => !p.es_exclusion);
              
              // Ordenar durmientes para que los líderes aparezcan siempre primero
              durmientes.sort((a, b) => {
                if (a.es_lider && !b.es_lider) return -1;
                if (!a.es_lider && b.es_lider) return 1;
                return 0;
              });

              const ocupados = durmientes.length;
              const libres = Math.max(0, cabana.capacidad - ocupados);
              const esMasculina = cabana.genero.toLowerCase().startsWith("masc");
              const esSoloBoanerges = esCabanaExclusivaBoanerges(cabana);

              // Crear el arreglo de todas las camas físicas (incluyendo sobregiro si los ocupantes exceden la capacidad)
              const totalSlots = Math.max(cabana.capacidad, durmientes.length);
              const slots = Array.from({ length: totalSlots }, (_, i) => durmientes[i] || null);

              return (
                <div
                  key={cabana.id}
                  className={`bg-white rounded-2xl border shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col h-[560px] ${
                    esMasculina 
                      ? "border-blue-200/80 hover:border-blue-400 border-t-4 border-t-blue-500" 
                      : "border-pink-200/80 hover:border-pink-400 border-t-4 border-t-pink-500"
                  }`}
                >
                  {/* Encabezado de la Cabaña (Altura fija para perfecta simetría) */}
                  <div className={`p-4 border-b h-[76px] flex items-center justify-between gap-3 flex-shrink-0 ${
                    esMasculina 
                      ? "bg-blue-50/80 border-blue-100" 
                      : "bg-pink-50/80 border-pink-100"
                  }`}>
                    <div className="overflow-hidden flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-black text-xl font-['Outfit',sans-serif] truncate ${
                          esMasculina ? "text-blue-950" : "text-pink-950"
                        }`}>
                          {cabana.nombre}
                        </h3>

                        {/* Botón Editar Cabaña */}
                        <button
                          type="button"
                          onClick={() => handleEditarCabana(cabana)}
                          className="p-1 text-muted-foreground hover:text-foreground bg-white/80 hover:bg-white rounded-lg border border-border/80 shadow-2xs transition-colors cursor-pointer"
                          title={`Editar configuración de ${cabana.nombre}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                        {cabana.bus ? (
                          <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[11px] border ${
                            esMasculina 
                              ? "text-blue-900 bg-white border-blue-200/80 shadow-2xs" 
                              : "text-pink-900 bg-white border-pink-200/80 shadow-2xs"
                          }`}>
                            <Bus className={`w-3.5 h-3.5 ${esMasculina ? "text-blue-600" : "text-pink-600"}`} />
                            {cabana.bus}
                          </span>
                        ) : (
                          <span className="text-[11px] italic">Sin bus asignado</span>
                        )}
                        <span>·</span>
                        <span className="font-semibold text-foreground/80">
                          {cabana.cantidad_lideres} {cabana.cantidad_lideres === 1 ? "líder" : "líderes"}
                        </span>
                        {esSoloBoanerges && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[11px] bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                              <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600" />
                              Solo Boanerges
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      {/* Botón rápido "+ Asignar" en el header */}
                      <button
                        type="button"
                        onClick={() => handleAbrirAsignacion(cabana)}
                        className="px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 bg-white rounded-lg border border-primary/30 shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                        title="Asignar líderes o campamenteros"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Asignar
                      </button>

                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg block ${
                        ocupados > cabana.capacidad
                          ? "bg-amber-500 text-white shadow-2xs animate-pulse"
                          : libres === 0 
                          ? "bg-red-500 text-white" 
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300/60"
                      }`}>
                        {ocupados > cabana.capacidad 
                          ? `+${ocupados - cabana.capacidad} SOBREGIRO`
                          : libres === 0 ? "LLENA" : `${libres} libres`}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Camas (Líderes de primero en fila amarilla + campamenteros + espacios libres) */}
                  <div className="p-3.5 bg-muted/10 divide-y divide-border/60 flex-1 overflow-y-auto space-y-1">
                    {/* Caso líder con exclusión: aparece de primero en fila amarilla suave sin consumir número de cama */}
                    {lideresExcluidos.map((persona) => {
                      const nombreCompleto = `${persona.primer_nombre} ${persona.segundo_nombre || ""} ${persona.primer_apellido} ${persona.segundo_apellido || ""}`.replace(/\s+/g, " ").trim();
                      const coincideBusqueda = Boolean(
                        busqueda.trim() && 
                        modoBusqueda === "persona" && 
                        personaCoincideConBusqueda(persona, busqueda)
                      );

                      return (
                        <div
                          key={persona.id}
                          className={`py-2.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs rounded-xl transition-colors my-1 ${
                            coincideBusqueda
                              ? "bg-amber-100/90 border-2 border-amber-500 shadow-sm ring-2 ring-amber-400/50"
                              : "bg-amber-50/80 hover:bg-amber-100/60 border border-amber-200/80 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="w-6 h-6 rounded-full font-black text-[10px] flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-800 border border-amber-300/60 shadow-2xs">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                            </span>
                            <span className="font-bold text-xs sm:text-sm text-foreground truncate" title={nombreCompleto}>
                              {nombreCompleto}
                            </span>
                            {coincideBusqueda && (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-600 text-white shadow-2xs flex-shrink-0 animate-pulse">
                                Coincidencia
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pl-8.5 sm:pl-0 flex-shrink-0">
                            {persona.numero_documento && (
                              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground bg-white/90 px-2 py-0.5 rounded-md border border-border/70 flex items-center gap-1 shadow-2xs">
                                <CreditCard className="w-3 h-3 text-slate-500" />
                                {persona.tipo_documento ? `${persona.tipo_documento}: ` : ""}{persona.numero_documento}
                              </span>
                            )}
                            {persona.celular && (
                              <span
                                className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground bg-white/90 px-2 py-0.5 rounded-md border border-border/70 flex items-center gap-1 shadow-2xs"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                {persona.celular}
                              </span>
                            )}
                            {persona.es_boanerges && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                                Boanerges
                              </span>
                            )}
                            {typeof persona.edad === "number" && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/90 text-slate-700 border-border/80 shadow-2xs">
                                {persona.edad} años
                              </span>
                            )}

                            {/* Botón Mover de Cabaña */}
                            <button
                              type="button"
                              onClick={() => handleAbrirMover(persona, cabana)}
                              className="p-1 text-muted-foreground/60 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer ml-1"
                              title={`Mover a ${nombreCompleto} a otra cabaña`}
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>

                            {/* Botón rápido Desasignar */}
                            <button
                              type="button"
                              onClick={() => handleDesasignarRapido(persona, cabana.nombre)}
                              className="p-1 text-muted-foreground/60 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer ml-1"
                              title={`Desasignar a ${nombreCompleto} de ${cabana.nombre}`}
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Camas físicas de la cabaña (incluye sobregiro si aplica) */}
                    {slots.map((persona, index) => {
                      const numCama = index + 1;
                      const esCamaSobregiro = numCama > cabana.capacidad;

                      if (persona) {
                        const esLider = persona.es_lider;
                        const noCumpleBoanerges = esSoloBoanerges && !persona.es_boanerges && !persona.es_lider;
                        const nombreCompleto = `${persona.primer_nombre} ${persona.segundo_nombre || ""} ${persona.primer_apellido} ${persona.segundo_apellido || ""}`.replace(/\s+/g, " ").trim();
                        const coincideBusqueda = Boolean(
                          persona && 
                          busqueda.trim() && 
                          modoBusqueda === "persona" && 
                          personaCoincideConBusqueda(persona, busqueda)
                        );

                        return (
                          <div
                            key={persona.id}
                            className={`py-2.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs rounded-xl transition-colors my-1 ${
                              coincideBusqueda
                                ? "bg-amber-50 border-2 border-amber-500 shadow-sm ring-2 ring-amber-400/40"
                                : esCamaSobregiro
                                ? "bg-amber-50/70 hover:bg-amber-100/70 border-2 border-dashed border-amber-300 shadow-2xs"
                                : noCumpleBoanerges
                                ? "bg-rose-50/80 hover:bg-rose-100/60 border border-rose-200/80 shadow-2xs"
                                : esLider
                                ? "bg-amber-50/80 hover:bg-amber-100/60 border border-amber-200/80 shadow-2xs"
                                : "hover:bg-white text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className={`w-6 h-6 rounded-full font-black text-[10px] flex items-center justify-center flex-shrink-0 ${
                                coincideBusqueda
                                  ? "bg-amber-500 text-white shadow-2xs"
                                  : esCamaSobregiro
                                  ? "bg-amber-500 text-white shadow-2xs"
                                  : noCumpleBoanerges
                                  ? "bg-rose-100 text-rose-800 border border-rose-300/60 shadow-2xs"
                                  : esLider
                                  ? "bg-amber-100 text-amber-800 border border-amber-300/60 shadow-2xs"
                                  : esMasculina ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                              }`}>
                                {numCama}
                              </span>
                              <span className="font-bold text-xs sm:text-sm text-foreground truncate" title={nombreCompleto}>
                                {nombreCompleto}
                              </span>
                              {coincideBusqueda && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-600 text-white shadow-2xs flex-shrink-0 animate-pulse">
                                  Coincidencia
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pl-8.5 sm:pl-0 flex-shrink-0">
                              {persona.numero_documento && (
                                <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground bg-white/90 px-2 py-0.5 rounded-md border border-border/70 flex items-center gap-1 shadow-2xs">
                                  <CreditCard className="w-3 h-3 text-slate-500" />
                                  {persona.tipo_documento ? `${persona.tipo_documento}: ` : ""}{persona.numero_documento}
                                </span>
                              )}
                              {persona.celular && (
                                <span
                                  className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground bg-white/90 px-2 py-0.5 rounded-md border border-border/70 flex items-center gap-1 shadow-2xs"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  {persona.celular}
                                </span>
                              )}
                              {esCamaSobregiro && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-900 border border-amber-400">
                                  Sobregiro (+{numCama - cabana.capacidad})
                                </span>
                              )}
                              {noCumpleBoanerges && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                                  ⚠️ No es Boanerges
                                </span>
                              )}
                              {persona.es_boanerges && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                                  Boanerges
                                </span>
                              )}
                              {typeof persona.edad === "number" && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-white/90 text-slate-700 border-border/80 shadow-2xs">
                                  {persona.edad} años
                                </span>
                              )}

                              {/* Botón Mover de Cabaña */}
                              <button
                                type="button"
                                onClick={() => handleAbrirMover(persona, cabana)}
                                className="p-1 text-muted-foreground/60 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer ml-1"
                                title={`Mover a ${nombreCompleto} a otra cabaña`}
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>

                              {/* Botón rápido Desasignar */}
                              <button
                                type="button"
                                onClick={() => handleDesasignarRapido(persona, cabana.nombre)}
                                className="p-1 text-muted-foreground/60 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer ml-0.5"
                                title={`Desasignar a ${nombreCompleto} de ${cabana.nombre}`}
                              >
                                <UserMinus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      // Cama Disponible (Espacio en Blanco con botón para asignar)
                      return (
                        <div
                          key={`vacia-${cabana.id}-${numCama}`}
                          className="py-2.5 px-3 flex items-center justify-between text-xs text-muted-foreground/60 rounded-xl border border-dashed border-border/80 my-1 bg-white/60 hover:bg-emerald-50/40 hover:border-emerald-300 transition-colors group cursor-pointer"
                          onClick={() => handleAbrirAsignacion(cabana)}
                          title={`Hacer clic para asignar a ${cabana.nombre}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-muted group-hover:bg-emerald-100 group-hover:text-emerald-800 text-muted-foreground font-semibold text-[10px] flex items-center justify-center flex-shrink-0 transition-colors">
                              {numCama}
                            </span>
                            <span className="italic text-xs font-medium text-muted-foreground/70 group-hover:text-emerald-900 flex items-center gap-1.5 transition-colors">
                              <BedDouble className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:text-emerald-600" />
                              Espacio disponible (Cama {numCama})
                            </span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAbrirAsignacion(cabana);
                            }}
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-200/80 group-hover:shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <UserPlus className="w-3 h-3" />
                            Asignar
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumen al pie de la cabaña (Altura fija h-[48px]) */}
                  <div className="p-3 bg-white border-t border-border flex items-center justify-between text-xs h-[48px] flex-shrink-0">
                    <span className="text-muted-foreground text-[11px] truncate">
                      Capacidad: <strong className="text-foreground">{cabana.capacidad} camas</strong>
                      {excluidos.length > 0 && (
                        <span className="text-amber-800 font-bold ml-1">
                          (+{excluidos.length} {excluidos.length === 1 ? "líder" : "líderes"})
                        </span>
                      )}
                    </span>
                    <span className={`font-bold text-xs px-2.5 py-1 rounded-md border flex-shrink-0 ${
                      ocupados > cabana.capacidad
                        ? "bg-amber-100 text-amber-900 border-amber-300 font-black"
                        : "bg-muted/60 text-foreground border-border/80"
                    }`}>
                      {ocupados} / {cabana.capacidad} cupos
                      {ocupados > cabana.capacidad && ` (+${ocupados - cabana.capacidad} sobregiro)`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (

          /* ===============================================================
             VISTA 2: PLANILLA / TABLA GENERAL RESUMEN
             =============================================================== */
          <div className="bg-white rounded-2xl border border-border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Cabaña</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Bus Asignado</th>
                    <th className="py-3 px-4 text-center">Capacidad</th>
                    <th className="py-3 px-4 text-center">Líderes</th>
                    <th className="py-3 px-4 text-center">Ocupadas</th>
                    <th className="py-3 px-4 text-center">Libres</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cabanasFiltradas.map((cabana, idx) => {
                    const integrantes = ocupacionPorCabana[cabana.id] || [];
                    const durmientes = integrantes.filter((p) => !p.es_exclusion);
                    const excluidos = integrantes.filter((p) => p.es_exclusion);
                    const ocupados = durmientes.length;
                    const libres = Math.max(0, cabana.capacidad - ocupados);
                    const esMasculina = cabana.genero.toLowerCase().startsWith("masc");
                    const personasCoincidentesEnCabana = busqueda.trim() && modoBusqueda === "persona"
                      ? integrantes.filter((p) => personaCoincideConBusqueda(p, busqueda))
                      : [];

                    return (
                      <tr key={cabana.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{idx + 1}</td>
                        <td className="py-3 px-4 font-black text-foreground font-['Outfit',sans-serif]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{cabana.nombre}</span>
                            {esCabanaExclusivaBoanerges(cabana) && (
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-0.5" title="Cabaña exclusiva Boanerges">
                                <Zap className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                                Boanerges
                              </span>
                            )}
                            {excluidos.length > 0 && (
                              <span className="text-[9px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300" title="Líder asignado">
                                +{excluidos.length} {excluidos.length === 1 ? "líder" : "líderes"}
                              </span>
                            )}
                          </div>
                          {personasCoincidentesEnCabana.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {personasCoincidentesEnCabana.map((p) => (
                                <span
                                  key={p.id}
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs"
                                >
                                  <User className="w-3 h-3 text-amber-700" />
                                  {p.primer_nombre} {p.primer_apellido}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            esMasculina ? "bg-blue-500/10 text-blue-700" : "bg-pink-500/10 text-pink-700"
                          }`}>
                            {cabana.genero}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-xs text-blue-800">
                          {cabana.bus ? (
                            <span className="inline-flex items-center gap-1">
                              <Bus className="w-3.5 h-3.5 text-blue-600" />
                              {cabana.bus}
                            </span>
                          ) : (
                            <span className="text-muted-foreground italic text-xs">Sin asignar</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-foreground">{cabana.capacidad}</td>
                        <td className="py-3 px-4 text-center font-bold text-foreground">{cabana.cantidad_lideres}</td>
                        <td className="py-3 px-4 text-center font-bold text-primary">{ocupados}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700">{libres}</td>
                        <td className="py-3 px-4">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            ocupados > cabana.capacidad
                              ? "bg-amber-500/20 text-amber-900 border border-amber-400 font-black"
                              : libres === 0 
                              ? "bg-red-500/15 text-red-700" 
                              : libres <= 3 
                              ? "bg-amber-500/15 text-amber-700" 
                              : "bg-emerald-500/15 text-emerald-700"
                          }`}>
                            {ocupados > cabana.capacidad 
                              ? `Sobregiro (${ocupados}/${cabana.capacidad})` 
                              : libres === 0 ? "Llena" : `${libres} disponibles`}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAbrirAsignacion(cabana)}
                              className="px-2.5 py-1 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg border border-primary/30 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Asignar integrantes"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              Asignar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditarCabana(cabana)}
                              className="p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Editar cabaña"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paginación Footer si aplica */}
        {porPagina > 0 && totalPaginas > 1 && vista === "cuadricula" && (
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-border shadow-xs text-xs">
            <span className="text-muted-foreground">
              Página <strong className="text-foreground">{paginaActual}</strong> de <strong className="text-foreground">{totalPaginas}</strong>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer transition-colors"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-1.5 border border-border rounded-lg hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed font-bold cursor-pointer transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Modal para Crear y Editar Cabañas */}
      <CabanaModal
        isOpen={cabanaModalOpen}
        cabana={cabanaParaEditar}
        busesExistentes={listaBuses}
        ocupantesCount={cabanaParaEditar ? (ocupacionPorCabana[cabanaParaEditar.id] || []).length : 0}
        onClose={() => setCabanaModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* Modal para Asignación Manual de Líderes y Campamenteros */}
      <AsignacionManualModal
        key={cabanaParaAsignar?.id || "modal-asignar"}
        isOpen={asignacionModalOpen}
        cabanaInicial={cabanaParaAsignar}
        todasLasCabanas={cabanas}
        campamenteros={campamenteros}
        onClose={() => setAsignacionModalOpen(false)}
        onDataChanged={fetchData}
      />

      {/* Modal para Asignación Automática y Balanceada de Cabañas (Solo Admin) */}
      <AsignarCabanasModal
        isOpen={asignarAutoModalOpen}
        cabanas={cabanas}
        campamenteros={campamenteros}
        onClose={() => setAsignarAutoModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* Modal para Mover a Otra Cabaña Manualmente */}
      <MoverCampamenteroModal
        isOpen={moverModalOpen}
        persona={personaParaMover}
        cabanaActual={cabanaDePersonaParaMover}
        todasLasCabanas={cabanas}
        campamenteros={campamenteros}
        onClose={() => setMoverModalOpen(false)}
        onSuccess={fetchData}
      />

      {/* Modal Moderno para Confirmar Quitar de Cabaña */}
      {personaParaDesasignar && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => !desasignando && setPersonaParaDesasignar(null)}
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
                ¿Deseas remover a <strong className="text-foreground">{personaParaDesasignar.persona.primer_nombre} {personaParaDesasignar.persona.primer_apellido}</strong> de la cabaña <strong className="text-foreground">{personaParaDesasignar.cabanaNombre}</strong>?
              </p>
              <p className="text-[11px] text-muted-foreground/80 bg-muted/40 p-2.5 rounded-xl border border-border/60">
                La persona <strong>no se borrará</strong> del campamento, únicamente quedará sin cabaña asignada para reubicarla.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPersonaParaDesasignar(null)}
                disabled={desasignando}
                className="px-4 py-2 text-xs font-bold text-foreground bg-muted hover:bg-muted/80 rounded-xl transition-colors cursor-pointer flex-1"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarDesasignar}
                disabled={desasignando}
                className="px-4 py-2 text-xs font-black text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {desasignando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Quitando...</span>
                  </>
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

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-white/40 text-center relative z-10">
        <p className="text-xs text-muted-foreground font-medium">
          Misión Bautista Internacional · 23 al 28 de noviembre · Monte Sión 2026
        </p>
      </footer>
    </div>
  );
}
