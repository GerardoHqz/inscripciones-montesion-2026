/**
 * Normaliza y sanitiza texto para la base de datos:
 * - Convierte a MAYÚSCULAS
 * - Remueve tildes y acentos (Á->A, É->E, Í->I, Ó->O, Ú->U, Ü->U)
 * - Preserva la letra Ñ / ñ (convirtiéndola en Ñ)
 * - Limpia espacios al inicio y al final
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/[áäàâ]/gi, "A")
    .replace(/[éëèê]/gi, "E")
    .replace(/[íïìî]/gi, "I")
    .replace(/[óöòô]/gi, "O")
    .replace(/[úüùû]/gi, "U")
    .replace(/ñ/g, "Ñ")
    .toUpperCase()
    .trim();
}

/**
 * Sanitiza un valor opcional: si está vacío devuelve null, sino el texto limpio.
 */
export function sanitizeOptionalText(text: string | null | undefined): string | null {
  const cleaned = sanitizeText(text);
  return cleaned === "" ? null : cleaned;
}
