import { Check } from "lucide-react";
import { FormData } from "../../types";

interface Props { data: FormData; sig: string | null; }

export function SuccessScreen({ data, sig }: Props) {
  const goHome = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center space-y-5">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
        <Check className="w-10 h-10 text-primary" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-foreground">Inscripcion Completada!</h2>
        <p className="text-muted-foreground mt-1">
          Gracias, <strong>{data.primerNombre} {data.apellidos}</strong>. Tu registro ha sido enviado exitosamente.
        </p>
      </div>
      {sig && (
        <div className="w-full max-w-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Firma registrada</p>
          <img src={sig} alt="Firma" className="w-full border border-border rounded-lg bg-white" />
        </div>
      )}
      <div className="text-sm text-muted-foreground bg-muted/40 rounded-xl p-4 max-w-md">
        Campamento <strong>Monte Sion 2026</strong> del 18 al 23 de noviembre.<br />
        Edificio Gamaliel, salida lunes a las 6:00am.
      </div>
      <button
        onClick={goHome}
        className="px-6 py-2.5 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-sm transition-colors mt-2 shadow-sm"
      >
        Volver al Inicio
      </button>
    </div>
  );
}
