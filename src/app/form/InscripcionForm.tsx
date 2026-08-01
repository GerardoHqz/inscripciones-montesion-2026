import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Check, AlertCircle, Loader2 } from "lucide-react";
import { useInscripcion } from "../../hooks/useInscripcion";
import { StepBar } from "./StepBar";
import { SuccessScreen } from "./SuccessScreen";
import { Screen1 } from "./Screen1";
import { Screen2 } from "./Screen2";
import { Screen3 } from "./Screen3";
import { Screen4 } from "./Screen4";
import { Screen5 } from "./Screen5";
import { NotasImportantesScreen } from "./NotasImportantesScreen";
import bannerImg from "../../imports/MONTE WEB-12.png";

const STEP_LABELS = [
  "Datos del Campamentero",
  "Contacto Padre/Tutor",
  "Emergencia y Salud",
  "Terminos y Declaracion",
  // "Firma",
];

export function InscripcionForm() {
  const [showNotice, setShowNotice] = useState(true);
  const {
    step, form, errors, sig, submitted, isSubmitting, submitError,
    esMayor, visibleSteps,
    setField, handleSign, next, back,
  } = useInscripcion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, showNotice, submitted]);

  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif] print:bg-white">
      <header className="w-full no-print overflow-hidden" style={{ height: '120px' }}>
        <img
          src={bannerImg}
          alt="Monte Sion 2026 - Taber x Jev"
          className="w-full h-full"
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        />
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 print:p-0 print:m-0 print:max-w-full print:bg-transparent">
        {submitted ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 print:p-0 print:border-none print:shadow-none print:bg-transparent">
            <SuccessScreen data={form} sig={sig} />
          </div>
        ) : showNotice ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-5 sm:p-8">
            <NotasImportantesScreen onStart={() => setShowNotice(false)} />
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
                  <>
                    <span>{step === 4 ? "Enviando..." : "Verificando..."}</span>
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </>
                ) : (
                  <>
                    <span>{step === 4 ? "Enviar Inscripcion" : "Siguiente"}</span>
                    {step < 4 ? <ChevronRight className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        <p className="text-center text-xs text-muted-foreground mt-4 no-print">
          Campamento Monte Sion 2026 · 23-28 noviembre
        </p>
      </main>
    </div>
  );
}
