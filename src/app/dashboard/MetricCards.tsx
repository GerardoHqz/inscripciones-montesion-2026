import { Users, CreditCard, Activity } from "lucide-react";
import { Registro } from "../../types";

interface Props { registros: Registro[]; }

export function MetricCards({ registros }: Props) {
  const total = registros.length;
  const completos = registros.filter((r) => r.tipo_pago === "completo").length;
  const medios = registros.filter((r) => r.tipo_pago === "medio pago").length;
  const menores = registros.filter((r) => r.edad < 18).length;
  const mayores = registros.filter((r) => r.edad >= 18).length;

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg text-primary"><Users className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Inscritos</p>
          <h3 className="text-2xl font-black text-foreground">{total}</h3>
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
        <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600"><CreditCard className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medio Pago</p>
          <h3 className="text-2xl font-black text-amber-600">{medios}</h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-[#0d2b20]/10 rounded-lg text-[#0d2b20]"><Activity className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menores / Mayores</p>
          <h3 className="text-base font-bold text-foreground">
            <span className="text-primary">{menores}</span> <span className="text-xs text-muted-foreground">menores</span>
            <span className="mx-1 text-muted-foreground">/</span>
            <span className="text-secondary">{mayores}</span> <span className="text-xs text-muted-foreground">mayores</span>
          </h3>
        </div>
      </div>
    </section>
  );
}
