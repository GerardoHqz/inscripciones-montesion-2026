// =========================================================================
// CONSTANTES Y CATÁLOGOS CENTRALIZADOS DEL SISTEMA
// Proyecto: Inscripción y Gestión Campamento Monte Sión
// =========================================================================

// ─── 1. CATÁLOGOS ESTÁTICOS ─────────────────────────────────────────────

/**
 * Tallas de camisa oficiales disponibles para los campamenteros.
 */
export const TALLAS_CAMISA = ["S", "M", "L", "XL", "XXL"] as const;
export const TALLAS_DISPONIBLES = TALLAS_CAMISA; // Alias de compatibilidad
export type TallaCamisa = typeof TALLAS_CAMISA[number];

/**
 * Modalidades de pago registradas en el sistema.
 */
export const TIPOS_PAGO = ["completo", "medio pago", "media beca", "becado"] as const;
export type TipoPago = typeof TIPOS_PAGO[number];

export const TIPOS_PAGO_OPCIONES: { valor: TipoPago; etiqueta: string }[] = [
  { valor: "completo", etiqueta: "Pago Completo" },
  { valor: "medio pago", etiqueta: "Medio Pago" },
  { valor: "media beca", etiqueta: "Media Beca" },
  { valor: "becado", etiqueta: "Becado" },
];

/**
 * Flota de buses oficial del campamento.
 */
export const BUSES_OFICIALES = [
  "Bus #1",
  "Bus #2",
  "Bus #3",
  "Bus #4",
  "Bus #5",
  "Bus #6",
  "Bus #7",
  "Bus #8",
  "Bus #9",
] as const;
export const BUSES_CAMPAMENTO = BUSES_OFICIALES; // Alias de compatibilidad
export type BusOficial = typeof BUSES_OFICIALES[number];

/**
 * Lista de relaciones y parentescos para contactos y emergencias.
 */
export const RELACIONES_PARENTESCO = [
  "Padre",
  "Madre",
  "Tutor",
  "Tutora",
  "Representante Legal",
  "Abuelo",
  "Abuela",
  "Hermano",
  "Hermana",
  "Tío",
  "Tía",
  "Primo",
  "Prima",
  "Padrastro",
  "Madrastra",
  "Cónyuge",
  "Hijo",
  "Hija",
  "Nieto",
  "Nieta",
  "Sobrino",
  "Sobrina",
  "Cuñado",
  "Cuñada",
  "Suegro",
  "Suegra",
  "Yerno",
  "Nuera",
  "Amigo",
  "Amiga",
  "Novio",
  "Novia",
  "Vecino",
  "Vecina",
  "Compañero",
  "Compañera",
  "Encargado",
  "Encargada",
  "Familiar",
  "Otro",
];
export const relaciones = RELACIONES_PARENTESCO; // Alias de compatibilidad

/**
 * Catálogo general de nacionalidades.
 */
export const NACIONALIDADES = [
  "Afgana",
  "Albanesa",
  "Alemana",
  "Andorrana",
  "Angoleña",
  "Antiguana y Barbudense",
  "Saudí",
  "Argelina",
  "Argentina",
  "Armenia",
  "Australiana",
  "Austriaca",
  "Azerbaiyana",
  "Bahameña",
  "Bangladesí",
  "Barbadense",
  "Bareiní",
  "Belga",
  "Beliceña",
  "Beninesa",
  "Bielorrusa",
  "Birmana",
  "Boliviana",
  "Bosnia",
  "Botsuanesa",
  "Brasileña",
  "Bruneana",
  "Búlgara",
  "Burkinesa",
  "Burundesa",
  "Butanesa",
  "Caboverdiana",
  "Camboyana",
  "Camerunesa",
  "Canadiense",
  "Catarí",
  "Chadiana",
  "Chilena",
  "China",
  "Chipriota",
  "Colombiana",
  "Comorense",
  "Congoleña",
  "Costarricense",
  "Croata",
  "Cubana",
  "Danesa",
  "Dominiquesa",
  "Dominicana",
  "Ecuatoriana",
  "Egipcia",
  "Salvadoreña",
  "Emiratí",
  "Eritrea",
  "Eslovaca",
  "Eslovena",
  "Española",
  "Estadounidense",
  "Estonia",
  "Esuatiní",
  "Etíope",
  "Filipina",
  "Finlandesa",
  "Fiyiana",
  "Francesa",
  "Gabonesa",
  "Gambiana",
  "Georgiana",
  "Ghanesa",
  "Granadina",
  "Griega",
  "Guatemalteca",
  "Guineana",
  "Guineoecuatorial",
  "Guineana-Bisauense",
  "Guyanesa",
  "Haitiana",
  "Hondureña",
  "Húngara",
  "India",
  "Indonesia",
  "Iraní",
  "Iraquí",
  "Irlandesa",
  "Islandesa",
  "Israelí",
  "Italiana",
  "Jamaiquina",
  "Japonesa",
  "Jordana",
  "Kazaja",
  "Keniana",
  "Kirguisa",
  "Kiribatiana",
  "Kuwaití",
  "Laosiana",
  "Lesotense",
  "Letona",
  "Libanesa",
  "Liberiana",
  "Libia",
  "Liechtensteiniana",
  "Lituana",
  "Luxemburguesa",
  "Malgache",
  "Malasia",
  "Malauí",
  "Maldiva",
  "Maliense",
  "Maltesa",
  "Marroquí",
  "Mauriciana",
  "Mauritana",
  "Mexicana",
  "Micronesia",
  "Moldava",
  "Monegasca",
  "Mongola",
  "Montenegrina",
  "Mozambiqueña",
  "Namibia",
  "Nauruana",
  "Nepalesa",
  "Neerlandesa",
  "Neozelandesa",
  "Nicaragüense",
  "Nigeriana",
  "Nigerina",
  "Norcoreana",
  "Noruega",
  "Omaní",
  "Pakistaní",
  "Palauana",
  "Panameña",
  "Papú",
  "Paraguaya",
  "Peruana",
  "Polaca",
  "Portuguesa",
  "Británica",
  "Centroafricana",
  "Checa",
  "Surcoreana",
  "Congoleña (RDC)",
  "Rumana",
  "Rusa",
  "Ruandesa",
  "Sancristobaleña",
  "Sanmarinense",
  "Sanvicentina",
  "Santalucense",
  "Santomense",
  "Senegalesa",
  "Serbia",
  "Seychellense",
  "Sierraleonesa",
  "Singapurense",
  "Siria",
  "Somalí",
  "Esrilanquesa",
  "Sudafricana",
  "Sudanesa",
  "Sursudanesa",
  "Sueca",
  "Suiza",
  "Surinamesa",
  "Tailandesa",
  "Tanzana",
  "Tayika",
  "Timorense",
  "Togolesa",
  "Tongana",
  "Trinitense",
  "Tunecina",
  "Turca",
  "Turcomana",
  "Tuvaluana",
  "Ucraniana",
  "Ugandesa",
  "Uruguaya",
  "Uzbeka",
  "Vanuatuense",
  "Vaticana",
  "Venezolana",
  "Vietnamita",
  "Yemení",
  "Zambiana",
  "Zimbabuense",
];
export const nacionalidades = NACIONALIDADES; // Alias de compatibilidad

// ─── 2. TEXTOS LEGALES Y REQUISITOS DOCUMENTALES ─────────────────────────

/**
 * Términos y condiciones legales que acepta el participante o responsable.
 */
export const TERMINOS_Y_CONDICIONES = [
  "Todo campamentero deberá hacerse responsable de sus pertenencias, maleta, dinero y documentación.",
  "Todo campamentero debe asistir por voluntad propia, y ser parte de las actividades, juegos, capillas, caminata, etc. que rigen el campamento.",
  "Ningún campamentero podrá regresarse antes de la fecha estipulada, a no ser caso de emergencia y/o emergencia médica que el médico evalúe y sea autorizado por los encargados.",
  "Todo campamentero mayor de edad está comprometido a respetar a todo menor de edad.",
  "Todo campamentero está comprometido a respetar al equipo de trabajo, líderes, compañeros de cabaña, reglamento del campamento y así mismo el cuido de las instalaciones.",
  "La Misión Bautista Internacional no se hará responsable de objetos perdidos.",
  "Todo campamentero deberá llevar sus pertenencias personales según sea indicado.",
  "La Misión Bautista Internacional no se hace responsable de fotos y videos compartidos no oficiales del campamento.",
];
export const TERMINOS = TERMINOS_Y_CONDICIONES; // Alias de compatibilidad

/**
 * Requisitos documentales obligatorios para la ficha impresa (PDF).
 */
export const REQUISITOS_DOCUMENTACION_MENORES = [
  "Partida de nacimiento vigente",
  "Fotocopia partida",
  "DUI ambos padres",
  "Fotocopia de DUI",
  "Pasaporte y copia 150%",
];

export const REQUISITOS_DOCUMENTACION_MAYORES = [
  "Fotocopia de DUI",
];

// ─── 3. PARÁMETROS DEL EVENTO (VALORES POR DEFECTO / FALLBACK) ───────────

export const CONFIG_EVENTO_DEFAULT = {
  nombreEvento: "Monte Sión 2026",
  fechasEventoTexto: "23 al 28 de noviembre",
  fechaInicio: "2026-11-23",
  fechaFin: "2026-11-28",
  fechaMinimaVencimientoDocumento: "2027-05-28",
  mesesVigenciaMinima: 6,
  cupoMaximoMenores: 205,
  edadMinima: 10,
  edadMayoriaEdad: 18,
  lugarPago: "Taber Store",
  inscripcionesActivas: true,
};

export const MAX_CUPOS_MENORES = CONFIG_EVENTO_DEFAULT.cupoMaximoMenores;

// ─── 4. UTILIDADES ESPECÍFICAS ──────────────────────────────────────────

/**
 * Determina si una cabaña es de uso exclusivo para el grupo Boanerges.
 */
export function esCabanaExclusivaBoanerges(cabana: { solo_boanerges?: boolean | null }): boolean {
  return Boolean(cabana.solo_boanerges);
}
