import { useEffect } from "react";
import { FormData } from "../../types";
import { Field } from "./Field";
import { SectionTitle } from "./SectionTitle";
import { Autocomplete } from "./Autocomplete";
import { relaciones } from "../../utils/constants";

const textareaClass = "w-full px-3 py-2.5 rounded-lg border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none placeholder:text-muted-foreground/50";

interface Props {
  data: FormData;
  onChange: (k: keyof FormData, v: string) => void;
  errors: Partial<Record<keyof FormData, string>>;
}

export function Screen3({ data, onChange, errors }: Props) {
  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange(e.target.name as keyof FormData, e.target.value);

  useEffect(() => {
    if (!data.emergenciaNombres && data.contacto1Nombres) {
      onChange("emergenciaNombres", data.contacto1Nombres);
    }
    if (!data.emergenciaApellidos && data.contacto1Apellidos) {
      onChange("emergenciaApellidos", data.contacto1Apellidos);
    }
    if (!data.emergenciaTelefono && data.contacto1Telefono) {
      onChange("emergenciaTelefono", data.contacto1Telefono);
    }
    if (!data.emergenciaRelacion && data.contacto1Relacion) {
      onChange("emergenciaRelacion", data.contacto1Relacion);
    }
  }, [data.contacto1Nombres, data.contacto1Apellidos, data.contacto1Telefono, data.contacto1Relacion]);

  return (
    <div className="space-y-6">
      <SectionTitle>Contacto de Emergencia</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Nombres" name="emergenciaNombres" autoComplete="given-name" value={data.emergenciaNombres} onChange={handle as React.ChangeEventHandler<HTMLInputElement>} required error={errors.emergenciaNombres} />
        <Field label="Apellidos" name="emergenciaApellidos" autoComplete="family-name" value={data.emergenciaApellidos} onChange={handle as React.ChangeEventHandler<HTMLInputElement>} required error={errors.emergenciaApellidos} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Telefono Celular" name="emergenciaTelefono" autoComplete="tel" value={data.emergenciaTelefono} onChange={handle as React.ChangeEventHandler<HTMLInputElement>} type="tel" placeholder="0000-0000" required error={errors.emergenciaTelefono} />
        <Autocomplete
          label="Relacion con el campamentero/a"
          name="emergenciaRelacion"
          value={data.emergenciaRelacion}
          onChange={onChange}
          options={relaciones}
          required
          error={errors.emergenciaRelacion}
          placeholder="Ej. Tío, Hermano..."
        />
      </div>

      <SectionTitle>Informacion Medica</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Enfermedad</label>
          <textarea name="enfermedades" value={data.enfermedades} onChange={handle as React.ChangeEventHandler<HTMLTextAreaElement>} rows={3} className={textareaClass} placeholder="Describa enfermedades conocidas..." />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tratamiento</label>
          <textarea name="tratamientoEnfermedades" value={data.tratamientoEnfermedades} onChange={handle as React.ChangeEventHandler<HTMLTextAreaElement>} rows={3} className={textareaClass} placeholder="Tratamiento para las enfermedades..." />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alergias</label>
          <textarea name="alergias" value={data.alergias} onChange={handle as React.ChangeEventHandler<HTMLTextAreaElement>} rows={3} className={textareaClass} placeholder="Alergias conocidas..." />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tratamiento</label>
          <textarea name="tratamientoAlergias" value={data.tratamientoAlergias} onChange={handle as React.ChangeEventHandler<HTMLTextAreaElement>} rows={3} className={textareaClass} placeholder="Tratamiento para las alergias..." />
        </div>
      </div>
    </div>
  );
}
