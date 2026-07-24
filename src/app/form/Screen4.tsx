import { Check, AlertCircle } from "lucide-react";
import { FormData, TERMINOS } from "../../types";
import { Field } from "./Field";
import { SectionTitle } from "./SectionTitle";

interface Props {
  data: FormData;
  onChange: (k: keyof FormData, v: string | boolean) => void;
  esMayor: boolean;
  errors: Partial<Record<keyof FormData, string>>;
}

export function Screen4({ data, onChange, esMayor, errors }: Props) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.name as keyof FormData, e.target.value);

  return (
    <div className="space-y-6">
      <SectionTitle>Terminos y Condiciones</SectionTitle>

      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2.5 max-h-56 overflow-y-auto">
        {TERMINOS.map((t, i) => (
          <div key={i} className="flex gap-2.5 text-sm text-foreground/80">
            <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
            <p className="leading-relaxed">{t}</p>
          </div>
        ))}
      </div>

      <SectionTitle>Declaracion Jurada</SectionTitle>

      <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4 text-sm text-foreground/80 leading-relaxed">
        Yo, <span className="font-semibold text-foreground">{data.declaranteNombre || "_______________"}</span> con DUI:{" "}
        <span className="font-semibold text-foreground">{data.declaranteDui || "_______________"}</span>, por este medio BAJO JURAMENTO, manifiesto, 1) Que autorizo a mi hijo para que asista al Campamento <strong>MONTESION 2026</strong>. 2) Que autorizo para que la <strong>Mision Bautista Internacional</strong> pueda tomar y divulgar fotos de mi hijo. 3) Me responsabilizo sobre el comportamiento de mi hijo. 4) Me comprometo a firmar el permiso migratorio requerido. 5) Que libero de todo tipo de responsabilidad a la <strong>Mision Bautista Internacional</strong>.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={esMayor ? "Nombre" : "Nombre del padre/madre responsable"} name="declaranteNombre" autoComplete="name" value={data.declaranteNombre} onChange={handle} required error={errors.declaranteNombre} />
        <Field label="DUI" name="declaranteDui" value={data.declaranteDui} onChange={handle} required error={errors.declaranteDui} />
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <div
          onClick={() => onChange("aceptaTerminos", !data.aceptaTerminos)}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            data.aceptaTerminos
              ? "bg-primary border-primary"
              : errors.aceptaTerminos
              ? "border-destructive bg-destructive/5 animate-pulse"
              : "border-border group-hover:border-primary/50"
          }`}
        >
          {data.aceptaTerminos && <Check className="w-3 h-3 text-white" />}
        </div>
        <div className="flex flex-col">
          <span className={`text-sm leading-relaxed ${errors.aceptaTerminos ? "text-destructive font-medium" : "text-foreground/80"}`}>
            He leido y acepto los terminos y condiciones del campamento Monte Sion 2026, y confirmo que la declaracion jurada es verdadera.
          </span>
          {errors.aceptaTerminos && (
            <span className="text-[10px] text-destructive font-semibold flex items-center gap-0.5 mt-0.5">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.aceptaTerminos}
            </span>
          )}
        </div>
      </label>
    </div>
  );
}
