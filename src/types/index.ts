import { User, Users, AlertCircle, FileText, PenLine } from "lucide-react";

// ─── Roles ─────────────────────────────────────────────────────────────

export type RolUsuario = 'admin' | 'operador' | 'cajero' | 'colaborador';

// ─── Registro (Dashboard) ─────────────────────────────────────────────────────

export interface Registro {
  id: string;
  created_at: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  primer_apellido: string;
  segundo_apellido: string | null;
  nacionalidad: string;
  fecha_nacimiento: string;
  edad: number;
  genero: string;
  talla_camisa: string | null;
  tipo_documento: 'DUI' | 'PASAPORTE';
  numero_documento: string;
  fecha_vencimiento_documento: string | null;
  celular: string;
  tipo_pago: 'completo' | 'medio pago' | 'media beca' | 'becado' | null;
  contacto1_nombres: string;
  contacto1_apellidos: string;
  contacto1_relacion: string;
  contacto1_telefono: string;
  contacto1_dui?: string | null;
  contacto1_dui_vencimiento?: string | null;
  contacto2_nombres: string | null;
  contacto2_apellidos: string | null;
  contacto2_relacion: string | null;
  contacto2_telefono: string | null;
  contacto2_dui?: string | null;
  contacto2_dui_vencimiento?: string | null;
  emergencia_nombres: string;
  emergencia_apellidos: string;
  emergencia_telefono: string;
  emergencia_relacion: string;
  enfermedades: string | null;
  tratamiento_enfermedades: string | null;
  alergias: string | null;
  tratamiento_alergias: string | null;
  declarante_nombre: string;
  declarante_dui: string;
  acepta_terminos: boolean;
  firma_url: string;
  numero_factura: string | null;
  user_ultima_actualizacion?: string | null;
  cabana_id?: string | null;
  es_empleado?: boolean | null;
  es_lider?: boolean | null;
  es_boanerges?: boolean | null;
  es_boanergues?: boolean | null;
  es_exclusion?: boolean | null;
}

export interface Cabana {
  id: string;
  nombre: string;
  genero: string;
  capacidad: number;
  cantidad_lideres: number;
  bus: string | null;
  solo_boanerges?: boolean | null;
}

// ─── FormData (Inscripcion) ───────────────────────────────────────────────────

export interface FormData {
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  nacionalidad: string;
  fechaNacimiento: string;
  edad: string;
  genero: "Masculino" | "Femenino" | "";
  tallaCamisa: string;
  tipoDocumento: "DUI" | "PASAPORTE" | "";
  numeroDocumento: string;
  fechaVencimientoDocumento: string;
  celular: string;
  tipoPago: "completo" | "medio pago" | "media beca" | "becado" | "";
  contacto1Nombres: string;
  contacto1Apellidos: string;
  contacto1Relacion: string;
  contacto1Telefono: string;
  contacto1Dui: string;
  contacto1DuiVencimiento: string;
  contacto2Nombres: string;
  contacto2Apellidos: string;
  contacto2Relacion: string;
  contacto2Telefono: string;
  contacto2Dui: string;
  contacto2DuiVencimiento: string;
  emergenciaNombres: string;
  emergenciaApellidos: string;
  emergenciaTelefono: string;
  emergenciaRelacion: string;
  enfermedades: string;
  tratamientoEnfermedades: string;
  alergias: string;
  tratamientoAlergias: string;
  declaranteNombre: string;
  declaranteDui: string;
  aceptaTerminos: boolean;
}

export const initialFormData: FormData = {
  primerNombre: "", segundoNombre: "", primerApellido: "", segundoApellido: "", nacionalidad: "",
  fechaNacimiento: "", edad: "", genero: "", tallaCamisa: "", tipoDocumento: "", numeroDocumento: "",
  fechaVencimientoDocumento: "", celular: "", tipoPago: "",
  contacto1Nombres: "", contacto1Apellidos: "", contacto1Relacion: "", contacto1Telefono: "", contacto1Dui: "", contacto1DuiVencimiento: "",
  contacto2Nombres: "", contacto2Apellidos: "", contacto2Relacion: "", contacto2Telefono: "", contacto2Dui: "", contacto2DuiVencimiento: "",
  emergenciaNombres: "", emergenciaApellidos: "", emergenciaTelefono: "", emergenciaRelacion: "",
  enfermedades: "", tratamientoEnfermedades: "", alergias: "", tratamientoAlergias: "",
  declaranteNombre: "", declaranteDui: "", aceptaTerminos: false,
};

// ─── Steps ────────────────────────────────────────────────────────────────────

export const STEPS = [
  { id: 1, label: "Campamentero", icon: User },
  { id: 2, label: "Contacto",     icon: Users },
  { id: 3, label: "Emergencia",   icon: AlertCircle },
  { id: 4, label: "Terminos",     icon: FileText },
  // { id: 5, label: "Firma",        icon: PenLine }, // Oculto: se firmará físicamente
] as const;

export type Step = typeof STEPS[number];

// ─── Constants (Re-exportadas desde utils/constants) ──────────────────────────

export {
  TALLAS_CAMISA,
  TALLAS_DISPONIBLES,
  TIPOS_PAGO,
  TIPOS_PAGO_OPCIONES,
  BUSES_OFICIALES,
  BUSES_CAMPAMENTO,
  RELACIONES_PARENTESCO,
  NACIONALIDADES,
  TERMINOS_Y_CONDICIONES,
  TERMINOS,
  REQUISITOS_DOCUMENTACION_MENORES,
  REQUISITOS_DOCUMENTACION_MAYORES,
  CONFIG_EVENTO_DEFAULT,
} from "../utils/constants";
export type { TallaCamisa, TipoPago, BusOficial } from "../utils/constants";

