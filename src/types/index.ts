import { User, Users, AlertCircle, FileText, PenLine } from "lucide-react";

// ─── Registro (Dashboard) ─────────────────────────────────────────────────────

export interface Registro {
  id: string;
  created_at: string;
  primer_nombre: string;
  segundo_nombre: string | null;
  apellidos: string;
  genero: string;
  fecha_nacimiento: string;
  edad: number;
  talla_camisa: string | null;
  dui_pasaporte: string;
  celular: string;
  tipo_pago: string;
  contacto1_nombres: string;
  contacto1_apellidos: string;
  contacto1_relacion: string;
  contacto1_telefono: string;
  contacto2_nombres: string | null;
  contacto2_apellidos: string | null;
  contacto2_relacion: string | null;
  contacto2_telefono: string | null;
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
}

// ─── FormData (Inscripcion) ───────────────────────────────────────────────────

export interface FormData {
  primerNombre: string;
  segundoNombre: string;
  apellidos: string;
  genero: "Masculino" | "Femenino" | "";
  fechaNacimiento: string;
  edad: string;
  tallaCamisa: string;
  duiPasaporte: string;
  celular: string;
  tipoPago: "completo" | "medio pago" | "";
  contacto1Nombres: string;
  contacto1Apellidos: string;
  contacto1Relacion: string;
  contacto1Telefono: string;
  contacto2Nombres: string;
  contacto2Apellidos: string;
  contacto2Relacion: string;
  contacto2Telefono: string;
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
  primerNombre: "", segundoNombre: "", apellidos: "", genero: "",
  fechaNacimiento: "", edad: "", tallaCamisa: "", duiPasaporte: "",
  celular: "", tipoPago: "",
  contacto1Nombres: "", contacto1Apellidos: "", contacto1Relacion: "", contacto1Telefono: "",
  contacto2Nombres: "", contacto2Apellidos: "", contacto2Relacion: "", contacto2Telefono: "",
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
  { id: 5, label: "Firma",        icon: PenLine },
] as const;

export type Step = typeof STEPS[number];

// ─── Constants ────────────────────────────────────────────────────────────────

export const TALLAS_DISPONIBLES = ["S", "M", "L", "XL", "XXL"] as const;

export const TERMINOS = [
  "Todo campamentero debera hacerse responsable de sus pertenencias, maleta, dinero y documentacion.",
  "Todo campamentero debe asistir por voluntad propia, y ser parte de las actividades, juegos, capillas, caminata, etc. que rigen el campamento MONTE SION 2026.",
  "Ningun campamentero podra regresarse antes de la fecha estipulada, a no ser caso de emergencia y/o emergencia medica y que el medico lo evalue y sea autorizado por los encargados.",
  "Todo campamentero mayor de edad esta comprometido a respetar a todo menor de edad.",
  "Todo campamentero esta comprometido a respetar al equipo de trabajo, lideres, companeros de cabana, reglamento del campamento y asi mismo del cuido de las instalaciones.",
  "La Mision Bautista Internacional no se hara responsable de objetos perdidos.",
  "Todo campamentero debera llevar sus pertenencias personales segun sea indicado.",
  "La Mision Bautista Internacional no se hace responsable de fotos y videos compartidos no oficiales del campamento.",
];
