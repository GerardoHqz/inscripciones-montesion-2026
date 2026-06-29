import { AlertCircle } from "lucide-react";
import { FormData } from "../../types";
import { Field } from "./Field";
import { SectionTitle } from "./SectionTitle";

interface Props {
  data: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export function Screen1({ data, onChange, errors }: Props) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.name as keyof FormData, e.target.value);

  return (
    <div className="space-y-5">
      <SectionTitle>Informacion del Campamentero/a</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Primer Nombre" name="primerNombre" value={data.primerNombre} onChange={handle} required error={errors.primerNombre} />
        <Field label="Segundo Nombre" name="segundoNombre" value={data.segundoNombre} onChange={handle} error={errors.segundoNombre} />
      </div>
      <Field label="Apellidos" name="apellidos" value={data.apellidos} onChange={handle} required error={errors.apellidos} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="col-span-2 flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
            <span>Genero<span className="text-red-500 ml-0.5">*</span></span>
            {errors.genero && (
              <span className="text-destructive text-[10px] lowercase first-letter:uppercase font-semibold flex items-center gap-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.genero}
              </span>
            )}
          </label>
          <div className="flex gap-3">
            {(["Masculino", "Femenino"] as const).map((g) => (
              <button
                key={g} type="button"
                onClick={() => onChange("genero", g)}
                className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  data.genero === g
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : errors.genero
                    ? "bg-input-background border-destructive text-destructive hover:border-destructive"
                    : "bg-input-background border-border text-foreground hover:border-primary/50"
                }`}
              >{g}</button>
            ))}
          </div>
        </div>
        <Field label="Fec. Nacimiento" name="fechaNacimiento" value={data.fechaNacimiento} onChange={handle} type="date" required error={errors.fechaNacimiento} />
        <Field label="Edad" name="edad" value={data.edad} onChange={handle} type="number" placeholder="0" required error={errors.edad} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Talla de Camisa" name="tallaCamisa" value={data.tallaCamisa} onChange={handle} placeholder="S / M / L / XL" error={errors.tallaCamisa} />
        <Field label="DUI o Pasaporte" name="duiPasaporte" value={data.duiPasaporte} onChange={handle} required error={errors.duiPasaporte} />
        <Field label="Celular" name="celular" value={data.celular} onChange={handle} type="tel" placeholder="0000-0000" required error={errors.celular} />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between items-center">
          <span>Tipo de Pago<span className="text-red-500 ml-0.5">*</span></span>
          {errors.tipoPago && (
            <span className="text-destructive text-[10px] lowercase first-letter:uppercase font-semibold flex items-center gap-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.tipoPago}
            </span>
          )}
        </label>
        <div className="flex gap-3">
          {(["completo", "medio pago"] as const).map((t) => (
            <button
              key={t} type="button"
              onClick={() => onChange("tipoPago", t)}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium capitalize transition-all ${
                data.tipoPago === t
                  ? "bg-secondary text-secondary-foreground border-secondary shadow-sm"
                  : errors.tipoPago
                  ? "bg-input-background border-destructive text-destructive hover:border-destructive"
                  : "bg-input-background border-border text-foreground hover:border-secondary/50"
              }`}
            >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
