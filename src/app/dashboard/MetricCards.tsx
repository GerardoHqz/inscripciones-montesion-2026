import { Users, CreditCard, Clock } from "lucide-react";
import { Registro } from "../../types";

interface Props {
  registros: Registro[];
  rol: 'admin' | 'colaborador';
}

export function MetricCards({ registros, rol }: Props) {
  const solicitudes = registros.filter((r) => r.tipo_pago === null).length;
  const activas = registros.filter((r) => r.tipo_pago !== null).length;
  const completos = registros.filter((r) => r.tipo_pago === "completo").length;
  const medios = registros.filter((r) => r.tipo_pago === "medio pago").length;

  return (
    <section className={`grid gap-4 mb-6 ${rol === 'admin' ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 md:grid-cols-3'}`}>
      {rol === 'admin' && (
        <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600"><Clock className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Solicitudes (Pendientes)</p>
            <h3 className="text-2xl font-black text-amber-600">{solicitudes}</h3>
          </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg text-primary"><Users className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inscripciones Activas</p>
          <h3 className="text-2xl font-black text-primary">{activas}</h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-secondary/10 rounded-lg text-secondary"><CreditCard className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pago Completo</p>
          <h3 className="text-2xl font-black text-secondary">{completos}</h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-600"><CreditCard className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medio Pago</p>
          <h3 className="text-2xl font-black text-emerald-600">{medios}</h3>
        </div>
      </div>
    </section>
  );
}
