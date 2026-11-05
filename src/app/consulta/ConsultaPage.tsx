import { useState, useEffect, useMemo } from "react";
import { 
  Search, Tent, Bus, Sparkles, User, CreditCard, 
  Calendar, Clock, X, ArrowLeft,
  AlertCircle, Zap
} from "lucide-react";
import { supabase } from "../../utils/supabase";
import { useConfiguracionEvento } from "../../hooks/useConfiguracionEvento";
import bannerImg from "../../imports/MONTE WEB-12.png";

interface CampamenteroConsulta {
  id: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  tipo_documento: string | null;
  numero_documento: string | null;
  genero: string;
  edad: number | null;
  cabana_id: string | null;
  es_lider?: boolean | null;
  es_boanerges?: boolean | null;
  es_boanergues?: boolean | null;
  tipo_pago?: string | null;
}

interface CabanaConsulta {
  id: string;
  nombre: string;
  genero: string;
  bus: string | null;
}

interface ConsultaPageProps {
  onBack?: () => void;
}

function normalizar(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export default function ConsultaPage({ onBack }: ConsultaPageProps) {
  const { config } = useConfiguracionEvento();
  const [busqueda, setBusqueda] = useState("");
  const [campamenteros, setCampamenteros] = useState<CampamenteroConsulta[]>([]);
  const [cabanas, setCabanas] = useState<CabanaConsulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos necesarios para consulta
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [resInsc, resCab] = await Promise.all([
          supabase.from("inscripciones").select("*"),
          supabase.from("cabanas").select("*").order("nombre", { ascending: true }),
        ]);

        if (resInsc.error) {
          console.warn("Aviso al cargar inscripciones:", resInsc.error.message);
        }
        if (resCab.error) {
          console.warn("Aviso al cargar cabañas:", resCab.error.message);
        }

        setCampamenteros(resInsc.data || []);
        setCabanas(resCab.data || []);
      } catch (err: any) {
        console.error("Error al cargar datos de consulta:", err);
        setError("No se pudo conectar con el servidor. Por favor intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Mapa de Cabañas por ID
  const cabanaMap = useMemo(() => {
    const map = new Map<string, CabanaConsulta>();
    for (const c of cabanas) {
      map.set(c.id, c);
    }
    return map;
  }, [cabanas]);

  // Mapa de Líderes por Cabaña ID
  const lideresPorCabana = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of campamenteros) {
      if (p.cabana_id && p.es_lider) {
        const nombre = `${p.primer_nombre} ${p.primer_apellido}`.trim();
        const lista = map.get(p.cabana_id) || [];
        lista.push(nombre);
        map.set(p.cabana_id, lista);
      }
    }
    return map;
  }, [campamenteros]);

  // Filtrar resultados según búsqueda (mínimo 2 caracteres)
  const queryNorm = normalizar(busqueda);
  const resultados = useMemo(() => {
    if (queryNorm.length < 2) return [];

    return campamenteros.filter((p) => {
      // Solo mostrar campamenteros inscritos activos (con pago registrado o líderes)
      const esElegible = p.tipo_pago !== null || Boolean(p.es_lider);
      if (!esElegible) return false;

      // Buscar por nombre completo
      const nombreCompleto = `${p.primer_nombre} ${p.segundo_nombre || ""} ${p.primer_apellido} ${p.segundo_apellido || ""}`;
      const nombreNorm = normalizar(nombreCompleto);
      if (nombreNorm.includes(queryNorm)) return true;

      // Buscar por documento
      const docNorm = normalizar(p.numero_documento || "");
      if (docNorm.includes(queryNorm)) return true;

      return false;
    });
  }, [campamenteros, queryNorm]);

  const handleVolver = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, "", "/home");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] font-['Inter',sans-serif] flex flex-col justify-between">
      {/* Banner Superior */}
      <header className="w-full relative overflow-hidden shadow-sm bg-primary/20" style={{ height: "130px" }}>
        <img
          src={bannerImg}
          alt="Monte Sion 2026 - Taber x Jev"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
          <button
            onClick={handleVolver}
            className="p-2 bg-white/90 hover:bg-white active:bg-white/80 backdrop-blur-md text-foreground text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer border border-white/60 hover:scale-105"
            title="Volver"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
            <span className="hidden sm:inline">Volver</span>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-3xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Encabezado */}
        <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <Tent className="w-3.5 h-3.5" />
            Consulta Oficial
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground font-['Outfit',sans-serif] tracking-tight">
            Consulta de Cabaña y Bus
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Ingresa tu nombre completo o tu número de DUI / Pasaporte para consultar en qué cabaña dormirás y cuál es tu bus de transporte asignado.
          </p>
        </div>

        {/* Barra de Búsqueda */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-border shadow-md space-y-2">
          <div className="relative">
            <Search className="w-5 h-5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Escribe tu nombre o número de DUI / Pasaporte..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoFocus
              className="w-full pl-11 pr-11 py-3 text-sm sm:text-base border border-border rounded-xl bg-muted/20 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold transition-all shadow-2xs"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors cursor-pointer"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {queryNorm.length >= 2 && (
            <div className="flex items-center justify-end text-[11px] text-muted-foreground px-1">
              <span className="font-semibold text-foreground">
                {resultados.length} {resultados.length === 1 ? "resultado encontrado" : "resultados encontrados"}
              </span>
            </div>
          )}
        </div>

        {/* Estado de Error (solo si el usuario ya buscó y no hay datos cargados) */}
        {error && queryNorm.length >= 2 && campamenteros.length === 0 && (
          <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-white border border-rose-300 rounded-lg text-rose-800 font-bold hover:bg-rose-100 transition-colors cursor-pointer text-xs flex-shrink-0"
            >
              Reintentar
            </button>
          </div>
        )}



        {/* Estado: No Encontrado */}
        {!loading && !error && queryNorm.length >= 2 && resultados.length === 0 && (
          <div className="bg-white p-8 rounded-3xl border border-border text-center space-y-4 shadow-sm animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-foreground font-['Outfit',sans-serif]">
                No encontramos registros con "{busqueda}"
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Por favor verifica que tu nombre o documento esté escrito correctamente. Si recién completaste tu inscripción o necesitas ayuda, acércate a la mesa de registro.
              </p>
            </div>
          </div>
        )}

        {/* Listado de Resultados */}
        {!loading && !error && resultados.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {resultados.map((persona) => {
              const cabanaAsignada = persona.cabana_id ? cabanaMap.get(persona.cabana_id) : null;
              const nombreCompleto = `${persona.primer_nombre} ${persona.segundo_nombre || ""} ${persona.primer_apellido} ${persona.segundo_apellido || ""}`.replace(/\s+/g, " ").trim();
              const esMasc = persona.genero.toLowerCase().startsWith("masc");
              const lideresCabana = persona.cabana_id ? lideresPorCabana.get(persona.cabana_id) || [] : [];
              const esBoanerges = Boolean(persona.es_boanerges || (persona as any).es_boanergues);

              return (
                <div
                  key={persona.id}
                  className="bg-white rounded-3xl border border-border shadow-md overflow-hidden transition-all hover:shadow-lg"
                >
                  {/* Cabecera de la Ficha del Campamentero */}
                  <div className={`p-5 sm:p-6 border-b flex flex-col gap-4 ${
                    esMasc ? "bg-blue-50/70 border-blue-100" : "bg-pink-50/70 border-pink-100"
                  }`}>
                    {/* Fila Principal: Avatar, Título y Nombre Completo */}
                    <div className="flex items-start gap-3.5">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${
                        esMasc ? "bg-blue-600 text-white" : "bg-pink-600 text-white"
                      }`}>
                        <User className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Campamentero Inscrito
                          </span>
                          {persona.es_lider && (
                            <span className="text-[11px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                              <Sparkles className="w-3 h-3 text-amber-700" />
                              Líder
                            </span>
                          )}
                          {esBoanerges && (
                            <span className="text-[11px] font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                              <Zap className="w-3 h-3 text-emerald-600" />
                              Boanerges
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-foreground font-['Outfit',sans-serif] leading-tight break-words">
                          {nombreCompleto}
                        </h2>
                      </div>
                    </div>

                    {/* Fila Destacada: DUI y Edad (visibles, claros y legibles) */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      {persona.numero_documento && (
                        <div className="bg-white rounded-xl border border-border/80 px-3.5 py-2 shadow-2xs flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${esMasc ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                              {persona.tipo_documento || "DUI"}
                            </span>
                            <span className="text-sm sm:text-base font-black text-foreground font-mono leading-none">
                              {persona.numero_documento}
                            </span>
                          </div>
                        </div>
                      )}

                      {typeof persona.edad === "number" && (
                        <div className="bg-white rounded-xl border border-border/80 px-3.5 py-2 shadow-2xs flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${esMasc ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
                              Edad
                            </span>
                            <span className="text-sm sm:text-base font-black text-foreground leading-none">
                              {persona.edad} años
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bloques de Cabaña, Transporte y Líderes */}
                  <div className="p-5 sm:p-6 space-y-3.5">
                    {cabanaAsignada ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {/* Tarjeta: Cabaña */}
                          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-gradient-to-br from-amber-50/50 via-white to-orange-50/30 flex items-center justify-between gap-4 shadow-2xs">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                                <Tent className="w-6 h-6" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                                  Cabaña
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-foreground font-['Outfit',sans-serif] tracking-tight">
                                  {cabanaAsignada.nombre}
                                </h3>
                              </div>
                            </div>
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
                              {cabanaAsignada.genero}
                            </span>
                          </div>

                          {/* Tarjeta: Bus de Transporte */}
                          <div className="p-4 sm:p-5 rounded-2xl border border-border bg-gradient-to-br from-blue-50/50 via-white to-sky-50/30 flex items-center justify-between gap-4 shadow-2xs">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                                <Bus className="w-6 h-6" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                                  Transporte Asignado
                                </span>
                                <h3 className="text-xl sm:text-2xl font-black text-blue-950 font-['Outfit',sans-serif] tracking-tight">
                                  {cabanaAsignada.bus || "Pendiente"}
                                </h3>
                              </div>
                            </div>
                            {cabanaAsignada.bus ? (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200 flex-shrink-0">
                                Asignado
                              </span>
                            ) : (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0">
                                Por asignar
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bloque: Líderes de Cabaña */}
                        <div className="p-4 rounded-2xl border border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                                Líderes de tu Cabaña
                              </span>
                              <p className="text-base sm:text-lg font-black text-foreground font-['Outfit',sans-serif] break-words">
                                {lideresCabana.length > 0 ? lideresCabana.join(" · ") : "Por asignar"}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground font-medium sm:text-right flex-shrink-0">
                            {lideresCabana.length > 1 ? "Líderes a cargo" : "Líder a cargo"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="p-4 sm:p-5 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                          <Clock className="w-4.5 h-4.5 text-amber-700 flex-shrink-0" />
                          <span>Asignación de Cabaña y Transporte en proceso</span>
                        </div>
                        <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                          Tu inscripción está confirmada. El equipo de logística está organizando la distribución de dormitorios y transporte. Vuelve a consultar pronto para conocer tu cabaña, líderes y bus asignado.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border bg-white/40 text-center">
        <p className="text-xs text-muted-foreground font-medium">
          Misión Bautista Internacional · {config.fechasEventoTexto} · {config.nombreEvento}
        </p>
      </footer>
    </div>
  );
}

