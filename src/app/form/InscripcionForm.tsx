import { ChevronRight, ChevronLeft, Check, AlertCircle, Loader2 } from "lucide-react";
import { useInscripcion } from "../../hooks/useInscripcion";
import { StepBar } from "./StepBar";
import { SuccessScreen } from "./SuccessScreen";
import { Screen1 } from "./Screen1";
import { Screen2 } from "./Screen2";
import { Screen3 } from "./Screen3";
import { Screen4 } from "./Screen4";
import { Screen5 } from "./Screen5";

const STEP_LABELS = [
  "Datos del Campamentero",
  "Contacto Padre/Tutor",
  "Emergencia y Salud",
  "Terminos y Declaracion",
  "Firma",
];

export function InscripcionForm() {
  const {
    step, form, errors, sig, submitted, isSubmitting, submitError,
    esMayor, visibleSteps,
    setField, handleSign, next, back,
  } = useInscripcion();

  const goHome = () => {
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif]">
      <header className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-5 text-center relative overflow-hidden">
        <button
          onClick={goHome}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center text-white"
          title="Volver al inicio"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)" }} />
        <div className="relative">
          <h1 className="text-xl sm:text-2xl font-bold tracking-wide font-['Outfit',sans-serif]">Monte Sion 2026</h1>
          <p className="text-xs sm:text-sm opacity-80 mt-0.5 font-medium tracking-widest uppercase">Taber x Jev</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {submitted ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
            <SuccessScreen data={form} sig={sig} />
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-5 sm:p-8">
            <StepBar current={step} steps={visibleSteps} />

            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Paso {visibleSteps.findIndex((s) => s.id === step) + 1} de {visibleSteps.length}
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground mt-1.5 font-['Outfit',sans-serif]">
                {STEP_LABELS[step - 1]}
              </h2>
            </div>

            <div className="min-h-[320px]">
              {step === 1 && <Screen1 data={form} onChange={setField} errors={errors} />}
              {step === 2 && <Screen2 data={form} onChange={setField} esMayor={esMayor} errors={errors} />}
              {step === 3 && <Screen3 data={form} onChange={setField} errors={errors} />}
              {step === 4 && <Screen4 data={form} onChange={setField} esMayor={esMayor} errors={errors} />}
              {step === 5 && <Screen5 onSign={handleSign} error={errors.sig} />}
            </div>

            {submitError && (
              <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
              <button
                type="button" onClick={back}
                disabled={step === 1 || isSubmitting}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${step === 1 || isSubmitting ? "opacity-30 cursor-not-allowed text-muted-foreground" : "text-foreground hover:bg-muted"}`}
              >
                <ChevronLeft className="w-4 h-4" /> Anterior
              </button>

              <button
                type="button" onClick={next} disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? (
                  <><span>Enviando...</span><Loader2 className="w-4 h-4 animate-spin" /></>
                ) : (
                  <>{step === 5 ? "Enviar Inscripcion" : "Siguiente"}{step < 5 ? <ChevronRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}</>
                )}
              </button>
            </div>
          </div>
        )}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Campamento Monte Sion 2026 · 18-23 noviembre · $125.00 por persona
        </p>
      </main>
    </div>
  );
}
