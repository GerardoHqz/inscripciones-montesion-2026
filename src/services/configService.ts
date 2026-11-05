import { supabase } from "../utils/supabase";
import { CONFIG_EVENTO_DEFAULT } from "../utils/constants";

export interface ConfiguracionEvento {
  nombreEvento: string;
  fechasEventoTexto: string;
  fechaInicio: string;
  fechaFin: string;
  fechaMinimaVencimientoDocumento: string;
  mesesVigenciaMinima: number;
  cupoMaximoMenores: number;
  edadMinima: number;
  edadMayoriaEdad: number;
  lugarPago: string;
  inscripcionesActivas: boolean;
}

let cachedConfig: ConfiguracionEvento | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minuto de caché en memoria

/**
 * Obtiene la configuración del evento desde Supabase con fallback a los valores por defecto.
 * Si la base de datos no está disponible o tarda, garantiza que la app continúe funcionando.
 */
export async function obtenerConfiguracionEvento(forceRefresh = false): Promise<ConfiguracionEvento> {
  const now = Date.now();
  if (!forceRefresh && cachedConfig && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedConfig;
  }

  try {
    const { data, error } = await supabase
      .from("configuracion_evento")
      .select("clave, valor");

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("Aviso al consultar configuracion_evento, usando valores por defecto:", error.message);
      }
      return cachedConfig || CONFIG_EVENTO_DEFAULT;
    }

    const mapa = new Map<string, string>();
    for (const fila of data) {
      mapa.set(fila.clave, fila.valor);
    }

    const config: ConfiguracionEvento = {
      nombreEvento: mapa.get("nombre_campamento") || CONFIG_EVENTO_DEFAULT.nombreEvento,
      fechasEventoTexto: mapa.get("fechas_evento_texto") || CONFIG_EVENTO_DEFAULT.fechasEventoTexto,
      fechaInicio: mapa.get("fecha_inicio_campamento") || CONFIG_EVENTO_DEFAULT.fechaInicio,
      fechaFin: mapa.get("fecha_fin_campamento") || CONFIG_EVENTO_DEFAULT.fechaFin,
      fechaMinimaVencimientoDocumento:
        mapa.get("fecha_minima_vencimiento_documento") || CONFIG_EVENTO_DEFAULT.fechaMinimaVencimientoDocumento,
      mesesVigenciaMinima:
        parseInt(mapa.get("meses_vigencia_minima_documento") || "", 10) || CONFIG_EVENTO_DEFAULT.mesesVigenciaMinima,
      cupoMaximoMenores:
        parseInt(mapa.get("cupo_maximo_menores") || "", 10) || CONFIG_EVENTO_DEFAULT.cupoMaximoMenores,
      edadMinima:
        parseInt(mapa.get("edad_minima_inscripcion") || "", 10) || CONFIG_EVENTO_DEFAULT.edadMinima,
      edadMayoriaEdad:
        parseInt(mapa.get("edad_mayoria_edad") || "", 10) || CONFIG_EVENTO_DEFAULT.edadMayoriaEdad,
      lugarPago: mapa.get("lugar_pago") || CONFIG_EVENTO_DEFAULT.lugarPago,
      inscripcionesActivas: mapa.has("inscripciones_activas")
        ? mapa.get("inscripciones_activas") === "true"
        : CONFIG_EVENTO_DEFAULT.inscripcionesActivas,
    };

    cachedConfig = config;
    lastFetchTime = now;
    return config;
  } catch (err) {
    console.warn("Excepción al obtener configuración de base de datos:", err);
    return cachedConfig || CONFIG_EVENTO_DEFAULT;
  }
}

/**
 * Actualiza un parámetro específico en la base de datos Supabase e invalida la caché.
 */
export async function actualizarParametroEvento(clave: string, valor: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("configuracion_evento")
      .update({ valor })
      .eq("clave", clave);

    if (error) {
      console.error("Error al actualizar parámetro en BD:", error);
      return false;
    }

    // Invalidar caché para que la siguiente lectura sea fresca
    cachedConfig = null;
    lastFetchTime = 0;
    return true;
  } catch (err) {
    console.error("Excepción al actualizar parámetro:", err);
    return false;
  }
}

