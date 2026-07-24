import { Search } from "lucide-react";
import { TALLAS_DISPONIBLES } from "../../types";

interface Props {
  search: string; setSearch: (v: string) => void;
  filtroPago: string; setFiltroPago: (v: string) => void;
  filtroGenero: string; setFiltroGenero: (v: string) => void;
  filtroEdad: string; setFiltroEdad: (v: string) => void;
  filtroTalla: string; setFiltroTalla: (v: string) => void;
}

const selectClass = "px-3 py-1.5 border border-border rounded-lg bg-input-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

export function FilterBar({ search, setSearch, filtroPago, setFiltroPago, filtroGenero, setFiltroGenero, filtroEdad, setFiltroEdad, filtroTalla, setFiltroTalla }: Props) {
  return (
    <section className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center justify-between">
      <div className="relative w-full lg:max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text" placeholder="Buscar por nombre, DUI, celular..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>

      <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 w-full lg:w-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pago:</span>
          <select value={filtroPago} onChange={(e) => setFiltroPago(e.target.value)} className={selectClass}>
            <option value="todos">Todos</option>
            <option value="completo">Completo</option>
            <option value="medio pago">Medio Pago</option>
            <option value="becado">Becado</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Genero:</span>
          <select value={filtroGenero} onChange={(e) => setFiltroGenero(e.target.value)} className={selectClass}>
            <option value="todos">Todos</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Edad:</span>
          <select value={filtroEdad} onChange={(e) => setFiltroEdad(e.target.value)} className={selectClass}>
            <option value="todos">Todos</option>
            <option value="menores">Menores (&lt; 18)</option>
            <option value="mayores">Mayores (&ge; 18)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Talla:</span>
          <select value={filtroTalla} onChange={(e) => setFiltroTalla(e.target.value)} className={selectClass}>
            <option value="todos">Todos</option>
            {TALLAS_DISPONIBLES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
    </section>
  );
}
