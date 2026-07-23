import { CheckCircle2, Store } from "lucide-react";
import { FormData } from "../../types";

interface Props { data: FormData; sig: string | null; }

export function SuccessScreen({ data }: Props) {
  const goHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-400">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-xs">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-black text-foreground font-['Outfit',sans-serif]">
          ¡Solicitud Completada!
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Gracias por completar el formulario futuro campamentero.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-900 text-xs sm:text-sm text-left flex items-start gap-3.5 max-w-md shadow-2xs">
        <div className="p-2 bg-amber-500/15 text-amber-700 rounded-lg shrink-0 mt-0.5">
          <Store className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-amber-950">Próximo paso importante:</p>
          <p className="text-amber-900/90 leading-relaxed">
            Para completar tu inscripción y reservar tu cupo, realiza tu pago correspondiente en <strong>Taber Store</strong>.
          </p>
        </div>
      </div>

      <button
        onClick={goHome}
        className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer mt-2"
      >
        Volver al Inicio
      </button>
    </div>
  );
}
