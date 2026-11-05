import { useState, useEffect } from "react";
import { ChevronLeft, RefreshCw, LogOut, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useRegistros } from "../../hooks/useRegistros";
import { useConfiguracionEvento } from "../../hooks/useConfiguracionEvento";
import { MetricCards } from "./MetricCards";
import { FilterBar } from "./FilterBar";
import { RegistrosTable } from "./RegistrosTable";
import { RegistroModal } from "./RegistroModal";
import { PrintArea } from "./PrintArea";
import { AdminUser } from "../App";
import * as XLSX from "xlsx";
import { Registro } from "../../types";

interface DashboardProps {
  onLogout: () => void;
  adminUser: AdminUser;
}

function normalizarTexto(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve tildes y acentos
    .trim();
}

function registroCoincideConBusqueda(reg: Registro, query: string): boolean {
  const q = normalizarTexto(query);
  if (!q) return true;

  // Separar la consulta en tokens/palabras independientes
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const nombresYApellidos = `${reg.primer_nombre || ""} ${reg.segundo_nombre || ""} ${reg.primer_apellido || ""} ${reg.segundo_apellido || ""}`;
  const textoCompleto = normalizarTexto(`${nombresYApellidos} ${reg.numero_documento || ""} ${reg.celular || ""}`);

  const docLimpio = (reg.numero_documento || "").replace(/[^0-9a-z]/gi, "").toLowerCase();
  const telLimpio = (reg.celular || "").replace(/[^0-9]/gi, "");

  return tokens.every((token) => {
    const tokenLimpio = token.replace(/[^0-9a-z]/gi, "").toLowerCase();
    const tokenNum = token.replace(/[^0-9]/gi, "");

    const coincideTexto = textoCompleto.includes(token);
    const coincideDoc = tokenLimpio.length >= 3 && docLimpio.includes(tokenLimpio);
    const coincideTel = tokenNum.length >= 4 && telLimpio.includes(tokenNum);

    return coincideTexto || coincideDoc || coincideTel;
  });
}

export default function DashboardPage({ onLogout, adminUser }: DashboardProps) {
  const { config } = useConfiguracionEvento();
  const {
    registros, loading, error, fetchRegistros,
    selected, setSelected,
    isEditing, isSaving, saveError, editForm,
    handleInputChange, handleStartEdit, handleCancelEdit, handleSaveEdit,
    confirmarPago,
  } = useRegistros(adminUser.token);

  useEffect(() => {
    if (error) {
      onLogout();
    }
  }, [error, onLogout]);

  const [tabActiva, setTabActiva] = useState<"activas" | "solicitudes">("activas");
  const [search, setSearch] = useState("");
  const [filtroPago, setFiltroPago] = useState("todos");
  const [filtroGenero, setFiltroGenero] = useState("todos");
  const [filtroEdad, setFiltroEdad] = useState("todos");
  const [filtroTalla, setFiltroTalla] = useState("todos");
  const [filtroEquipo, setFiltroEquipo] = useState("todos");

  // Navegar al home verificando que la sesión sigue activa
  const goHome = () => {
    const saved = localStorage.getItem("ms_admin_session");
    if (!saved) { onLogout(); return; }
    try {
      const session = JSON.parse(saved);
      if (!session?.token) { onLogout(); return; }
    } catch {
      onLogout(); return;
    }
    window.history.pushState({}, "", "/home");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };
 
  const cumpleFiltrosFiltroBar = (reg: Registro) => {
    const matchSearch = registroCoincideConBusqueda(reg, search);
    const matchPago = filtroPago === "todos" || reg.tipo_pago === filtroPago;
    const matchGenero = filtroGenero === "todos" || reg.genero === filtroGenero;
    const matchEdad = filtroEdad === "todos" ? true : filtroEdad === "menores" ? reg.edad < 18 : reg.edad >= 18;
    const matchTalla = filtroTalla === "todos" || (reg.talla_camisa || "").trim().toUpperCase() === filtroTalla.toUpperCase();
    const matchEquipo = filtroEquipo === "todos" 
      ? true 
      : filtroEquipo === "campamenteros" 
      ? !reg.es_empleado 
      : filtroEquipo === "equipo" 
      ? Boolean(reg.es_empleado) 
      : true;
    return matchSearch && matchPago && matchGenero && matchEdad && matchTalla && matchEquipo;
  };

  const cantActivasFiltradas = registros.filter((r) => r.tipo_pago !== null && cumpleFiltrosFiltroBar(r)).length;
  const cantSolicitudesFiltradas = registros.filter((r) => r.tipo_pago === null && cumpleFiltrosFiltroBar(r)).length;

  const registrosFiltrados = registros.filter((reg) => {
    const matchTab = tabActiva === "activas" ? reg.tipo_pago !== null : reg.tipo_pago === null;
    return matchTab && cumpleFiltrosFiltroBar(reg);
  });




  const handleDownloadRawData = () => {
    const dataToExport = registrosFiltrados.map((reg) => ({
      "ID": reg.id,
      "Fecha Registro": reg.created_at ? new Date(reg.created_at).toLocaleString() : "",
      "Primer Nombre": reg.primer_nombre,
      "Segundo Nombre": reg.segundo_nombre || "",
      "Primer Apellido": reg.primer_apellido,
      "Segundo Apellido": reg.segundo_apellido || "",
      "Nacionalidad": reg.nacionalidad,
      "Fecha Nacimiento": reg.fecha_nacimiento,
      "Edad": reg.edad,
      "Género": reg.genero,
      "Talla Camisa": reg.talla_camisa || "",
      "Tipo Documento": reg.tipo_documento,
      "Número Documento": reg.numero_documento,
      "Fecha Vencimiento Documento": reg.fecha_vencimiento_documento || "",
      "Celular": reg.celular,
      "Tipo Pago": reg.tipo_pago || "",
      "Contacto 1 Nombres": reg.contacto1_nombres,
      "Contacto 1 Apellidos": reg.contacto1_apellidos,
      "Contacto 1 Relación": reg.contacto1_relacion,
      "Contacto 1 Teléfono": reg.contacto1_telefono,
      "Contacto 1 DUI": reg.contacto1_dui || "",
      "Contacto 1 Vencimiento DUI": reg.contacto1_dui_vencimiento || "",
      "Contacto 2 Nombres": reg.contacto2_nombres || "",
      "Contacto 2 Apellidos": reg.contacto2_apellidos || "",
      "Contacto 2 Relación": reg.contacto2_relacion || "",
      "Contacto 2 Teléfono": reg.contacto2_telefono || "",
      "Contacto 2 DUI": reg.contacto2_dui || "",
      "Contacto 2 Vencimiento DUI": reg.contacto2_dui_vencimiento || "",
      "Emergencia Nombres": reg.emergencia_nombres,
      "Emergencia Apellidos": reg.emergencia_apellidos,
      "Emergencia Relación": reg.emergencia_relacion,
      "Emergencia Teléfono": reg.emergencia_telefono,
      "Enfermedades": reg.enfermedades || "",
      "Tratamiento Enfermedades": reg.tratamiento_enfermedades || "",
      "Alergias": reg.alergias || "",
      "Tratamiento Alergias": reg.tratamiento_alergias || "",
      "Declarante Nombre": reg.declarante_nombre,
      "Declarante DUI": reg.declarante_dui,
      "Acepta Términos": reg.acepta_terminos ? "Sí" : "No",
      "Firma URL": reg.firma_url,
      "Número Factura": reg.numero_factura || "",
      "Equipo de Trabajo": reg.es_empleado ? "Sí" : "No",
      "Líder": reg.es_lider ? "Sí" : "No",
      "Boanerges": (reg.es_boanerges ?? reg.es_boanergues) ? "Sí" : "No",
      "Exclusión Cabaña": reg.es_exclusion ? "Sí" : "No",
      "Usuario Actualización": reg.user_ultima_actualizacion || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inscripciones Activas");
    const safeName = config.nombreEvento.replace(/\s+/g, "_");
    XLSX.writeFile(workbook, `Inscripciones_Activas_Completo_${safeName}.xlsx`);
  };

  const handleDownloadMigration = () => {
    const dataToExport = registrosFiltrados.map((reg) => {
      const obsParts: string[] = [];
      if (reg.enfermedades) {
        obsParts.push(`Enfermedades: ${reg.enfermedades}${reg.tratamiento_enfermedades ? ` (Tratamiento: ${reg.tratamiento_enfermedades})` : ''}`);
      }
      if (reg.alergias) {
        obsParts.push(`Alergias: ${reg.alergias}${reg.tratamiento_alergias ? ` (Tratamiento: ${reg.tratamiento_alergias})` : ''}`);
      }
      const observaciones = obsParts.join(" | ");

      return {
        "Nombres 1": reg.primer_nombre,
        "Nombre 2": reg.segundo_nombre || "",
        "Apellido1": reg.primer_apellido,
        "Apellido2": reg.segundo_apellido || "",
        "Nacionalidad": reg.nacionalidad,
        "Fecha de Nacimiento": reg.fecha_nacimiento,
        "Sexo": reg.genero,
        "Tipo Documento": reg.tipo_documento,
        "Número de Documento": reg.numero_documento,
        "Fecha de Vencimiento": reg.fecha_vencimiento_documento || "",
        "Observaciones": observaciones
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Migración");
    const safeName = config.nombreEvento.replace(/\s+/g, "_");
    XLSX.writeFile(workbook, `Inscripciones_Activas_Migracion_${safeName}.xlsx`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f6f4] flex flex-col items-center justify-center gap-3 no-print font-['Inter',sans-serif]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">Verificando credenciales y cargando datos...</p>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#1f2937] font-['Inter',sans-serif] pb-12 print:bg-white print:p-0">

      <style>{`
        @media print {
          @page { margin: 0; size: letter; }
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            padding: 1.2cm 1.4cm !important;
          }
          .no-print { display: none !important; }
          #print-area {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            background: white !important;
          }
          .page-break-before {
            page-break-before: always !important;
            break-before: page !important;
          }
        }
      `}</style>

      <header className="bg-primary text-white px-6 py-4 shadow-md no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center text-white" title="Volver al inicio">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-wide font-['Outfit',sans-serif]">Panel de Inscripciones</h1>
              <p className="text-xs opacity-75 uppercase tracking-wider font-semibold">{config.nombreEvento} - Taber x Jev</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await fetchRegistros();
                toast.success("Datos actualizados correctamente.");
              }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-sm font-semibold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Actualizar datos
            </button>
            <button onClick={onLogout} className="p-2 bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg transition-all cursor-pointer text-white shadow-sm flex items-center justify-center" title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6 no-print">
        <MetricCards registros={registros} rol={adminUser.rol} />

        <FilterBar
          search={search} setSearch={setSearch}
          filtroPago={filtroPago} setFiltroPago={setFiltroPago}
          filtroGenero={filtroGenero} setFiltroGenero={setFiltroGenero}
          filtroEdad={filtroEdad} setFiltroEdad={setFiltroEdad}
          filtroTalla={filtroTalla} setFiltroTalla={setFiltroTalla}
          filtroEquipo={filtroEquipo} setFiltroEquipo={setFiltroEquipo}
        />

        {/* Pestañas de Navegación del Dashboard y Botones de Descarga */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#e5e7eb] mb-6 gap-4 no-print mt-4">
          <div className="flex gap-6">
            <button
              onClick={() => setTabActiva("activas")}
              className={`pb-3 text-sm font-bold tracking-wide relative transition-colors cursor-pointer ${
                tabActiva === "activas"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Inscripciones Activas
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-bold">
                {cantActivasFiltradas}
              </span>
            </button>
            {(adminUser.rol === "admin" || adminUser.rol === "operador" || adminUser.rol === "cajero") && (
              <button
                onClick={() => setTabActiva("solicitudes")}
                className={`pb-3 text-sm font-bold tracking-wide relative transition-colors cursor-pointer ${
                  tabActiva === "solicitudes"
                    ? "text-amber-600 border-b-2 border-amber-600"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Solicitudes de Inscripción
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-600 font-bold">
                  {cantSolicitudesFiltradas}
                </span>
              </button>
            )}
          </div>

          {/* Botones de Descarga Excel (Solo para Inscripciones Activas y roles Admin/Operador) */}
          {tabActiva === "activas" && (adminUser.rol === "admin" || adminUser.rol === "operador") && (
            <div className="flex items-center gap-2 pb-2 sm:pb-0">
              <button
                onClick={handleDownloadRawData}
                disabled={loading || registrosFiltrados.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-600/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed active:bg-emerald-200/80 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-sm"
                title="Descargar todos los campos de base de datos de los registros activos"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar Data
              </button>
              <button
                onClick={handleDownloadMigration}
                disabled={loading || registrosFiltrados.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed active:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow"
                title="Descargar excel formateado para la migración"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Descargar Migración
              </button>
            </div>
          )}
        </div>

        <section className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <RegistrosTable
            registros={registrosFiltrados}
            loading={loading}
            error={error}
            onSelect={setSelected}
            onRetry={fetchRegistros}
            tabActiva={tabActiva}
          />
        </section>
      </main>

      {selected && (
        <RegistroModal
          registro={selected}
          isEditing={isEditing}
          isSaving={isSaving}
          saveError={saveError}
          editForm={editForm}
          onInputChange={handleInputChange}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
          onClose={() => { setSelected(null); }}
          onPrint={() => window.print()}
          onConfirmarPago={confirmarPago}
          rol={adminUser.rol}
        />
      )}

      {selected && <PrintArea registro={selected} />}
    </div>
  );
}
