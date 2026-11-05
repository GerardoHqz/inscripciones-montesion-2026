import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Check, AlertCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useInscripcion } from "../../hooks/useInscripcion";
import { StepBar } from "./StepBar";
import { SuccessScreen } from "./SuccessScreen";
import { PasoDatosCampamentero } from "./PasoDatosCampamentero";
import { PasoContactoPadres } from "./PasoContactoPadres";
import { PasoEmergenciaSalud } from "./PasoEmergenciaSalud";
import { PasoTerminosDeclaracion } from "./PasoTerminosDeclaracion";
import { PasoFirmaDigital } from "./PasoFirmaDigital";
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
    step, form, errors, sig, submitted, isSubmitting, submitError, setSubmitError,
    esMayor, visibleSteps, config,
    setField, handleSign, next, back,
  } = useInscripcion();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, showNotice, submitted]);

  const handleRegresar = () => {
    const savedSession = localStorage.getItem("ms_admin_session");
    if (savedSession) {
      window.history.pushState({}, "", "/home");
    } else {
      window.history.pushState({}, "", "/login");
    }
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

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

      <main className="max-w-2xl mx-auto px-4 py-4 print:p-0 print:m-0 print:max-w-full print:bg-transparent">
        <div className="flex justify-between items-center mb-4 no-print">
          <button
            type="button"
            onClick={handleRegresar}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all cursor-pointer border border-border shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" /> Regresar
          </button>
        </div>
        {!config.inscripcionesActivas ? (
          <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-foreground font-['Outfit',sans-serif]">
              Inscripciones Cerradas
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              Las inscripciones para el {config.nombreEvento} se encuentran temporalmente cerradas o han finalizado. Si ya realizaste tu registro, puedes consultar tu asignación de cabaña y transporte.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  window.history.pushState({}, "", "/consulta");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
              >
                Consultar mi Cabaña y Bus
              </button>
            </div>
          </div>
        ) : submitted ? (
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
              {step === 1 && <PasoDatosCampamentero data={form} onChange={setField} errors={errors} />}
              {step === 2 && <PasoContactoPadres data={form} onChange={setField} esMayor={esMayor} errors={errors} />}
              {step === 3 && <PasoEmergenciaSalud data={form} onChange={setField} errors={errors} />}
              {step === 4 && <PasoTerminosDeclaracion data={form} onChange={setField} esMayor={esMayor} errors={errors} />}
              {step === 5 && <PasoFirmaDigital onSign={handleSign} error={errors.sig} />}
            </div>

            {submitError && submitError.includes("Cupos para menores") && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
                onClick={() => setSubmitError(null)}
              >
                <div 
                  className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-destructive/30 p-6 sm:p-7 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200 cursor-default"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-16 h-16 rounded-full bg-destructive/15 text-destructive flex items-center justify-center shadow-inner">
                    <AlertTriangle className="w-9 h-9" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-foreground font-['Outfit',sans-serif] tracking-tight">
                      ⚠️ Cupos para menores de edad agotados
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Se ha alcanzado el límite máximo de inscripciones para menores de 18 años.
                    </p>
                  </div>

                  <div className="w-full pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSubmitError(null);
                      }}
                      className="w-full py-3 bg-primary hover:bg-primary/90 active:scale-[0.99] text-primary-foreground font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Entendido</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {submitError && !submitError.includes("Cupos para menores") && (
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
