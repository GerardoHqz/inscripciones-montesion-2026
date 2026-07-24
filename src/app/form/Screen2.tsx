import { FormData } from "../../types";
import { Field } from "./Field";
import { SectionTitle } from "./SectionTitle";
import { Autocomplete } from "./Autocomplete";
import { relaciones } from "../../utils/constants";

interface Props {
  data: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  esMayor: boolean;
  errors: Partial<Record<keyof FormData, string>>;
}

export function Screen2({ data, onChange, esMayor, errors }: Props) {
  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.target.name as keyof FormData, e.target.value);

  return (
    <div className="space-y-6">
      <SectionTitle>
        {esMayor ? "Informacion de Contacto" : "Informacion de Contacto (Padre/Madre/Tutor)"}
      </SectionTitle>

      <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
        {!esMayor && <p className="text-xs font-bold text-primary uppercase tracking-wider">Contacto 1</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombres" name="contacto1Nombres" autoComplete="given-name" value={data.contacto1Nombres} onChange={handle} required error={errors.contacto1Nombres} />
          <Field label="Apellidos" name="contacto1Apellidos" autoComplete="family-name" value={data.contacto1Apellidos} onChange={handle} required error={errors.contacto1Apellidos} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Autocomplete
            label="Relacion con el campamentero/a"
            name="contacto1Relacion"
            value={data.contacto1Relacion}
            onChange={onChange}
            options={relaciones}
            required
            error={errors.contacto1Relacion}
            placeholder="Ej. Padre, Madre..."
          />
          <Field label="Telefono Celular" name="contacto1Telefono" autoComplete="tel" value={data.contacto1Telefono} onChange={handle} type="tel" placeholder="0000-0000" required error={errors.contacto1Telefono} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Documento de Identidad" name="contacto1Dui" value={data.contacto1Dui} onChange={handle} required error={errors.contacto1Dui} />
        </div>
      </div>

      {!esMayor && (
        <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-4">
          <p className="text-xs font-bold text-secondary uppercase tracking-wider">Contacto 2</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombres" name="contacto2Nombres" autoComplete="given-name" value={data.contacto2Nombres} onChange={handle} error={errors.contacto2Nombres} />
            <Field label="Apellidos" name="contacto2Apellidos" autoComplete="family-name" value={data.contacto2Apellidos} onChange={handle} error={errors.contacto2Apellidos} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Autocomplete
              label="Relacion con el campamentero/a"
              name="contacto2Relacion"
              value={data.contacto2Relacion}
              onChange={onChange}
              options={relaciones}
              error={errors.contacto2Relacion}
              placeholder="Ej. Tío, Hermano..."
            />
            <Field label="Telefono Celular" name="contacto2Telefono" autoComplete="tel" value={data.contacto2Telefono} onChange={handle} type="tel" placeholder="0000-0000" error={errors.contacto2Telefono} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Documento de Identidad" name="contacto2Dui" value={data.contacto2Dui} onChange={handle} error={errors.contacto2Dui} />
          </div>
        </div>
      )}
    </div>
  );
}
