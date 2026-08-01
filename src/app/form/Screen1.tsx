import { AlertCircle } from "lucide-react";
import { FormData } from "../../types";
import { Field } from "./Field";
import { SectionTitle } from "./SectionTitle";
import { Autocomplete } from "./Autocomplete";
import { nacionalidades } from "../../utils/constants";

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
        <Field label="Primer Nombre" name="primerNombre" autoComplete="given-name" value={data.primerNombre} onChange={handle} required error={errors.primerNombre} />
        <Field label="Segundo Nombre" name="segundoNombre" autoComplete="additional-name" value={data.segundoNombre} onChange={handle} error={errors.segundoNombre} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Primer Apellido" name="primerApellido" autoComplete="family-name" value={data.primerApellido} onChange={handle} required error={errors.primerApellido} />
        <Field label="Segundo Apellido" name="segundoApellido" autoComplete="family-name" value={data.segundoApellido} onChange={handle} error={errors.segundoApellido} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Genero<span className="text-red-500 ml-0.5">*</span>
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
          {errors.genero && (
            <span className="text-destructive text-[11px] font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.genero}
            </span>
          )}
        </div>
        <Field
          label="Fec. Nacimiento"
          name="fechaNacimiento"
          autoComplete="bday"
          value={data.fechaNacimiento}
          onChange={handle}
          type="date"
          required
          error={errors.fechaNacimiento}
        />
        <Field label="Edad" name="edad" value={data.edad} onChange={handle} type="number" placeholder="0" required error={errors.edad} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Autocomplete
          label="Nacionalidad"
          name="nacionalidad"
          value={data.nacionalidad}
          onChange={onChange}
          options={nacionalidades}
          required
          error={errors.nacionalidad}
          placeholder="Ej. Salvadoreña"
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Talla de Camisa</label>
          <select
            name="tallaCamisa"
            value={data.tallaCamisa}
            onChange={(e) => onChange("tallaCamisa", e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 transition-all border-border focus:ring-primary/40 focus:border-primary"
          >
            <option value="">Seleccione una talla</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </div>
        <Field label="Celular" name="celular" autoComplete="tel" value={data.celular} onChange={handle} type="tel" placeholder="0000-0000" required error={errors.celular} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tipo Documento<span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="flex gap-2">
            {(["DUI", "PASAPORTE"] as const).map((doc) => {
              const esMenor = data.edad ? parseInt(data.edad, 10) < 18 : false;
              const disabled = doc === "DUI" && esMenor;
              return (
                <button
                  key={doc} type="button"
                  disabled={disabled}
                  onClick={() => onChange("tipoDocumento", doc)}
                  className={`flex-1 py-2.5 px-1 rounded-lg border text-xs sm:text-sm font-bold tracking-wider transition-all ${
                    disabled
                      ? "opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-border"
                      : data.tipoDocumento === doc
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : errors.tipoDocumento
                      ? "bg-input-background border-destructive text-destructive hover:border-destructive"
                      : "bg-input-background border-border text-foreground hover:border-primary/50"
                  }`}
                >{doc}</button>
              );
            })}
          </div>
          {errors.tipoDocumento && (
            <span className="text-destructive text-[11px] font-semibold flex items-center gap-1 mt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.tipoDocumento}
            </span>
          )}
        </div>
        <Field label="Número Documento" name="numeroDocumento" value={data.numeroDocumento} onChange={handle} placeholder="Ej. 00000000-0" required error={errors.numeroDocumento} />
        <Field
          label="Fecha Vencimiento Doc."
          name="fechaVencimientoDocumento"
          value={data.fechaVencimientoDocumento}
          onChange={handle}
          type="date"
          required
          min="2027-05-28"
          labelClassName="text-[11px] sm:text-xs whitespace-nowrap tracking-tight"
          error={errors.fechaVencimientoDocumento}
        />
      </div>
    </div>
  );
}
