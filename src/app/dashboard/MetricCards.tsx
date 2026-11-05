import { Users, CreditCard, Clock, GraduationCap, UserCheck, ShieldCheck, Briefcase } from "lucide-react";
import { Registro, RolUsuario } from "../../types";
import { useConfiguracionEvento } from "../../hooks/useConfiguracionEvento";

interface Props {
  registros: Registro[];
  rol: RolUsuario;
}

export function MetricCards({ registros }: Props) {
  const { config } = useConfiguracionEvento();
  const solicitudes = registros.filter((r) => r.tipo_pago === null).length;
  // Excluir a los empleados de las inscripciones activas
  const registrosActivos = registros.filter((r) => r.tipo_pago !== null && !r.es_empleado);
  const activas = registrosActivos.length;
  const completos = registrosActivos.filter((r) => r.tipo_pago === "completo").length;
  const medios = registrosActivos.filter((r) => r.tipo_pago === "medio pago").length;
  const mediasBecas = registrosActivos.filter((r) => r.tipo_pago === "media beca").length;
  const becados = registrosActivos.filter((r) => r.tipo_pago === "becado").length;
  const menores = registrosActivos.filter((r) => r.edad < config.edadMayoriaEdad).length;
  const mayores = registrosActivos.filter((r) => r.edad >= config.edadMayoriaEdad).length;
  const masculino = registrosActivos.filter((r) => r.genero === "Masculino").length;
  const femenino = registrosActivos.filter((r) => r.genero === "Femenino").length;
  const equipoTrabajo = registros.filter((r) => r.es_empleado === true || r.es_empleado === "true" as any).length;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Linea 1 */}
      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-amber-500/10 rounded-lg text-amber-600"><Clock className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Solicitudes (Pendientes)</p>
          <h3 className="text-2xl font-black text-amber-600">{solicitudes}</h3>
        </div>
      </div>

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

      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-teal-500/10 rounded-lg text-teal-600"><CreditCard className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Media Beca</p>
          <h3 className="text-2xl font-black text-teal-600">{mediasBecas}</h3>
        </div>
      </div>

      {/* Linea 2 */}
      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-purple-500/10 rounded-lg text-purple-600"><GraduationCap className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Becado</p>
          <h3 className="text-2xl font-black text-purple-600">{becados}</h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-sky-500/10 rounded-lg text-sky-600"><UserCheck className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menores de Edad</p>
          <h3 className="text-2xl font-black text-sky-600">{menores}</h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-600"><ShieldCheck className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mayores de Edad</p>
          <h3 className="text-2xl font-black text-indigo-600">{mayores}</h3>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-rose-500/10 rounded-lg text-rose-600"><Users className="w-5 h-5" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sexo / Género</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-medium text-muted-foreground">M: <strong className="text-xl font-black text-blue-600">{masculino}</strong></span>
            <span className="text-muted-foreground/30">|</span>
            <span className="text-xs font-medium text-muted-foreground">F: <strong className="text-xl font-black text-rose-600">{femenino}</strong></span>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm flex items-center gap-3">
        <div className="p-3 bg-blue-500/10 rounded-lg text-blue-600"><Briefcase className="w-5 h-5" /></div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Equipo de Trabajo</p>
          <h3 className="text-2xl font-black text-blue-600">{equipoTrabajo}</h3>
        </div>
      </div>
    </section>
  );
}
