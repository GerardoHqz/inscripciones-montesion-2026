import { useState } from "react";
import { AlertCircle, Store, CheckCircle2, ArrowRight, Check, Calendar, FileText } from "lucide-react";
import { useConfiguracionEvento } from "../../hooks/useConfiguracionEvento";

interface Props {
  onStart: () => void;
}

export function NotasImportantesScreen({ onStart }: Props) {
  const [accepted, setAccepted] = useState(false);
  const { config } = useConfiguracionEvento();

  const fechaPartes = config.fechaMinimaVencimientoDocumento.split("-");
  const fechaFormateada =
    fechaPartes.length === 3
      ? `${fechaPartes[2]}/${fechaPartes[1]}/${fechaPartes[0]}`
      : config.fechaMinimaVencimientoDocumento;

  return (
    <div className="space-y-6 py-2 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 text-xs font-bold uppercase tracking-wider">
          <AlertCircle className="w-4 h-4" />
          Aviso Importante
        </div>
        <h2 className="text-2xl font-black text-foreground font-['Outfit',sans-serif]">
          Antes de comenzar tu registro
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Por favor lee atentamente la siguiente información sobre el proceso de inscripción para el {config.nombreEvento}.
        </p>
      </div>

      <div className="space-y-4">
        {/* Tarjeta 1: Fechas del Campamento */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 shadow-2xs">
          <div className="p-2.5 bg-emerald-500/15 text-emerald-700 rounded-lg shrink-0 mt-0.5">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-emerald-950 font-['Outfit',sans-serif]">
              Fechas del Campamento
            </h3>
            <p className="text-xs text-emerald-900/90 mt-0.5 leading-relaxed font-medium">
              El Campamento {config.nombreEvento} se realizará del <strong className="font-extrabold text-emerald-950">{config.fechasEventoTexto}</strong>.
            </p>
          </div>
        </div>

        {/* Tarjeta 2: Vigencia Mínima del Documento */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 shadow-2xs">
          <div className="p-2.5 bg-blue-500/15 text-blue-700 rounded-lg shrink-0 mt-0.5">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-blue-950 font-['Outfit',sans-serif]">
              Vigencia Mínima de Documento (DUI / Pasaporte)
            </h3>
            <p className="text-xs text-blue-900/90 mt-0.5 leading-relaxed font-medium">
              Por regulaciones de viaje, tu DUI o Pasaporte debe contar con al menos <strong className="font-extrabold text-blue-950">{config.mesesVigenciaMinima} meses de vigencia</strong> posteriores a la fecha del campamento (debe vencer <strong className="font-extrabold text-blue-950">a partir del {fechaFormateada}</strong>).
            </p>
          </div>
        </div>

        {/* Tarjeta 3: Registro de Datos */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-foreground font-['Outfit',sans-serif]">
              Formulario de Datos Personales
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              El formulario a continuación es únicamente un registro con tus datos personales, información médica y contacto de emergencia.
            </p>
          </div>
        </div>

        {/* Tarjeta 4: Pago */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 shadow-2xs">
          <div className="p-2.5 bg-amber-500/15 text-amber-700 rounded-lg shrink-0 mt-0.5">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-900 font-['Outfit',sans-serif]">
              Confirmación de Cupo e Inscripción
            </h3>
            <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed font-medium">
              Tu cupo e inscripción se asegurará <span className="font-extrabold underline decoration-amber-500/40">únicamente cuando hayas completado tu pago en {config.lugarPago}</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Checkbox de confirmación */}
      <div className="pt-2">
        <label className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-pointer select-none">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            accepted 
              ? "bg-primary border-primary text-primary-foreground shadow-2xs" 
              : "border-muted-foreground/40 bg-background hover:border-primary"
          }`}>
            {accepted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <span className="text-xs font-semibold text-foreground leading-relaxed">
            He leído y comprendo que el llenado de este formulario es únicamente de datos y que mi cupo e inscripción se asegurará al realizar mi pago en <strong>Taber Store</strong>.
          </span>
        </label>
      </div>

      {/* Botón de acción */}
      <div className="pt-4 border-t border-border flex justify-end">
        <button
          type="button"
          disabled={!accepted}
          onClick={onStart}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-[0.99] ${
            accepted
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg cursor-pointer"
              : "bg-muted text-muted-foreground/50 border border-border cursor-not-allowed shadow-none"
          }`}
        >
          <span>Comenzar Inscripción</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
