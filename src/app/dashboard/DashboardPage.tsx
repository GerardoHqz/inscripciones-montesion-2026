/// <reference types="vite/client" />
import { useState } from "react";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { useRegistros } from "../../hooks/useRegistros";
import { MetricCards } from "./MetricCards";
import { FilterBar } from "./FilterBar";
import { RegistrosTable } from "./RegistrosTable";
import { RegistroModal } from "./RegistroModal";
import { PrintArea } from "./PrintArea";

export default function DashboardPage() {
  const {
    registros, loading, error, fetchRegistros,
    selected, setSelected,
    isEditing, isSaving, saveError, editForm,
    handleInputChange, handleStartEdit, handleCancelEdit, handleSaveEdit,
  } = useRegistros();

  const [search, setSearch] = useState("");
  const [filtroPago, setFiltroPago] = useState("todos");
  const [filtroGenero, setFiltroGenero] = useState("todos");
  const [filtroEdad, setFiltroEdad] = useState("todos");
  const [filtroTalla, setFiltroTalla] = useState("todos");

  const registrosFiltrados = registros.filter((reg) => {
    const nombre = `${reg.primer_nombre} ${reg.segundo_nombre || ""} ${reg.apellidos}`.toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = nombre.includes(q) || reg.dui_pasaporte.toLowerCase().includes(q) || reg.celular.includes(q);
    const matchPago = filtroPago === "todos" || reg.tipo_pago === filtroPago;
    const matchGenero = filtroGenero === "todos" || reg.genero === filtroGenero;
    const matchEdad = filtroEdad === "todos" ? true : filtroEdad === "menores" ? reg.edad < 18 : reg.edad >= 18;
    const matchTalla = filtroTalla === "todos" || (reg.talla_camisa || "").trim().toUpperCase() === filtroTalla.toUpperCase();
    return matchSearch && matchPago && matchGenero && matchEdad && matchTalla;
  });

  const goHome = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="min-h-screen bg-[#f3f6f4] text-[#1f2937] font-['Inter',sans-serif] pb-12 print:bg-white print:p-0">

      <style>{`
        @media print {
          @page { margin: 0; }
          body { background: white !important; color: black !important; margin: 1.2cm 1.4cm !important; padding: 0 !important; }
          .no-print { display: none !important; }
          #print-area { display: block !important; padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
        }
      `}</style>

      <header className="bg-gradient-to-r from-primary to-secondary text-white px-6 py-4 shadow no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={goHome} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center text-white" title="Volver al inicio">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-wide font-['Outfit',sans-serif]">Panel de Inscripciones</h1>
              <p className="text-xs opacity-75 uppercase tracking-wider font-semibold">Monte Sion 2026 - Taber x Jev</p>
            </div>
          </div>
          <button onClick={fetchRegistros} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg text-sm font-semibold transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Actualizar datos
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-6 no-print">
        <MetricCards registros={registros} />

        <FilterBar
          search={search} setSearch={setSearch}
          filtroPago={filtroPago} setFiltroPago={setFiltroPago}
          filtroGenero={filtroGenero} setFiltroGenero={setFiltroGenero}
          filtroEdad={filtroEdad} setFiltroEdad={setFiltroEdad}
          filtroTalla={filtroTalla} setFiltroTalla={setFiltroTalla}
        />

        <section className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <RegistrosTable
            registros={registrosFiltrados}
            loading={loading}
            error={error}
            onSelect={setSelected}
            onRetry={fetchRegistros}
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
        />
      )}

      {selected && <PrintArea registro={selected} />}
    </div>
  );
}
