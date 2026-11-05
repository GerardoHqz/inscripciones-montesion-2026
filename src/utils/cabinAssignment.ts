import { supabase } from "./supabase";
import { CONFIG_EVENTO_DEFAULT } from "./constants";

export interface CampamenteroData {
  id: string;
  primer_nombre: string;
  segundo_nombre?: string | null;
  primer_apellido: string;
  segundo_apellido?: string | null;
  genero: string;
  edad?: number | null;
  fecha_nacimiento?: string | null;
  es_lider?: boolean | null;
  es_boanerges?: boolean | null;
  es_boanergues?: boolean | null;
  es_exclusion?: boolean | null;
  cabana_id?: string | null;
  tipo_pago?: string | null;
}

export interface CabanaData {
  id: string;
  nombre: string;
  genero: string;
  capacidad: number;
  cantidad_lideres?: number;
  solo_boanerges?: boolean | null;
  bus?: string | null;
}

export interface AsignacionOpciones {
  soloSinCabana?: boolean; // Si es true, solo asigna a quienes no tienen cabana_id
  edadMayoria?: number;    // Umbral de mayoría de edad (default según configuración)
}

export interface AsignacionResumen {
  totalProcesados: number;
  totalAsignados: number;
  masculinos: {
    total: number;
    menores: number;
    mayores: number;
    boanerges: number;
  };
  femeninos: {
    total: number;
    menores: number;
    mayores: number;
    boanerges: number;
  };
  lideresProtegidos: number;
  cabanasUtilizadas: number;
}

/**
 * Función Fisher-Yates para barajar aleatoriamente
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Obtener la edad de una persona considerando el campo edad o fecha_nacimiento
 */
export function calcularEdadPersona(persona: { edad?: number | null; fecha_nacimiento?: string | null }): number {
  if (typeof persona.edad === "number" && !isNaN(persona.edad) && persona.edad >= 0) {
    return persona.edad;
  }
  if (persona.fecha_nacimiento) {
    const parts = persona.fecha_nacimiento.split("-").map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      const birth = new Date(parts[0], parts[1] - 1, parts[2]);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      return age >= 0 ? age : 0;
    }
  }
  return 0;
}

interface CabanaConEspacio extends CabanaData {
  libres: number;
  targetMenores: number;
  asignadosMenores: CampamenteroData[];
  asignadosMayores: CampamenteroData[];
}

/**
 * Distribuye campamenteros en cabañas de manera equitativa y proporcional entre menores y mayores de edad.
 */
function distribuirProporcional(
  campamenteros: CampamenteroData[],
  cabanasConLibres: { cabana: CabanaData; libres: number }[],
  edadMayoria: number = CONFIG_EVENTO_DEFAULT.edadMayoriaEdad
): CabanaConEspacio[] {
  const menores = shuffleArray(
    campamenteros.filter((c) => calcularEdadPersona(c) < edadMayoria)
  );
  const mayores = shuffleArray(
    campamenteros.filter((c) => calcularEdadPersona(c) >= edadMayoria)
  );

  const totalGente = campamenteros.length;
  const ratioMenores = menores.length / (totalGente || 1);

  const cabinState: CabanaConEspacio[] = cabanasConLibres.map(({ cabana, libres }) => {
    const targetMenores = Math.round(libres * ratioMenores);
    return {
      ...cabana,
      libres,
      targetMenores,
      asignadosMenores: [],
      asignadosMayores: [],
    };
  });

  // Paso 1: Asignar menores respetando cuota proporcional y balanceando entre cabañas
  for (const menor of menores) {
    let validCabins = cabinState.filter(
      (c) =>
        c.asignadosMenores.length < c.targetMenores &&
        c.asignadosMenores.length + c.asignadosMayores.length < c.libres
    );

    // Si todas alcanzaron su target inicial, buscar cualquier cabaña con espacio libre
    if (validCabins.length === 0) {
      validCabins = cabinState.filter(
        (c) => c.asignadosMenores.length + c.asignadosMayores.length < c.libres
      );
    }

    // SOBREGIRO: Si todas las cabañas alcanzaron su capacidad máxima, no dejamos a nadie fuera!
    // Se distribuye el sobregiro equitativamente entre las cabañas candidatas
    if (validCabins.length === 0) {
      validCabins = [...cabinState];
    }

    if (validCabins.length === 0) break; // Solo si no hay cabañas configuradas

    // Priorizar cabaña con menos menores asignados; en empate, con más espacio libre (o menor sobregiro)
    validCabins.sort((a, b) => {
      const diffMin = a.asignadosMenores.length - b.asignadosMenores.length;
      if (diffMin !== 0) return diffMin;
      const totalOcupA = a.asignadosMenores.length + a.asignadosMayores.length;
      const totalOcupB = b.asignadosMenores.length + b.asignadosMayores.length;
      const freeA = a.libres - totalOcupA;
      const freeB = b.libres - totalOcupB;
      return freeB - freeA;
    });

    validCabins[0].asignadosMenores.push(menor);
  }

  // Paso 2: Asignar mayores en los espacios restantes (con soporte de sobregiro)
  for (const mayor of mayores) {
    let validCabins = cabinState.filter(
      (c) => c.asignadosMenores.length + c.asignadosMayores.length < c.libres
    );

    // SOBREGIRO: Si no hay camas libres oficiales, continuar en sobregiro para no dejar a nadie fuera
    if (validCabins.length === 0) {
      validCabins = [...cabinState];
    }

    if (validCabins.length === 0) break;

    // Priorizar cabaña con menos mayores asignados; en empate, con más espacio libre (o menor sobregiro)
    validCabins.sort((a, b) => {
      const diffMay = a.asignadosMayores.length - b.asignadosMayores.length;
      if (diffMay !== 0) return diffMay;
      const totalOcupA = a.asignadosMenores.length + a.asignadosMayores.length;
      const totalOcupB = b.asignadosMenores.length + b.asignadosMayores.length;
      const freeA = a.libres - totalOcupA;
      const freeB = b.libres - totalOcupB;
      return freeB - freeA;
    });

    validCabins[0].asignadosMayores.push(mayor);
  }

  return cabinState;
}

/**
 * Realiza el cálculo de asignación completa respetando:
 * 1. Líderes quedan intactos (no se mueven).
 * 2. Cabañas exclusivas Boanerges solo para campamenteros Boanerges.
 * 3. Género estricto (Varones a cabañas masculinas, Señoritas a femeninas).
 * 4. Reparto perfectamente balanceado entre menores (<18) y mayores (>=18).
 */
export function calcularAsignacionAutomatica(
  todosCampamenteros: CampamenteroData[],
  todasCabanas: CabanaData[],
  opciones: AsignacionOpciones = {}
): {
  updates: Array<{ id: string; cabana_id: string }>;
  resumen: AsignacionResumen;
} {
  const edadMayoria = opciones.edadMayoria || CONFIG_EVENTO_DEFAULT.edadMayoriaEdad;

  // Prioridad y elegibilidad: solo personas con pago confirmado O que cuenten con flag de líder
  const elegibles = todosCampamenteros.filter(
    (p) => p.tipo_pago !== null || Boolean(p.es_lider)
  );
  const lideres = elegibles.filter((p) => Boolean(p.es_lider));
  const noLideres = elegibles.filter((p) => !p.es_lider);

  // Determinar a quiénes asignar
  const campamenterosAAsignar = opciones.soloSinCabana
    ? noLideres.filter((p) => !p.cabana_id)
    : noLideres;

  // Mapa de ocupación actual de líderes (para calcular camas libres)
  // Quienes duermen en cabaña son aquellos con es_exclusion !== true
  const durmientesPorCabana: Record<string, number> = {};
  for (const c of todasCabanas) {
    durmientesPorCabana[c.id] = 0;
  }

  // Los líderes siempre ocupan espacio si no tienen exclusión
  for (const lid of lideres) {
    if (lid.cabana_id && durmientesPorCabana[lid.cabana_id] !== undefined) {
      if (!lid.es_exclusion) {
        durmientesPorCabana[lid.cabana_id]++;
      }
    }
  }

  // Si solo estamos asignando a los que no tienen cabaña, los campamenteros que ya tienen cabaña
  // también deben reservar su cama actual
  if (opciones.soloSinCabana) {
    for (const p of noLideres) {
      if (p.cabana_id && durmientesPorCabana[p.cabana_id] !== undefined) {
        if (!p.es_exclusion) {
          durmientesPorCabana[p.cabana_id]++;
        }
      }
    }
  }

  const updates: Array<{ id: string; cabana_id: string }> = [];

  // Función auxiliar para preparar cabañas candidatas con sus camas libres disponibles
  const prepararCabanas = (filtroGenero: string, soloBoanerges: boolean) => {
    return todasCabanas
      .filter((c) => {
        const matchGen = c.genero.toLowerCase().startsWith(filtroGenero.toLowerCase());
        const matchBoan = Boolean(c.solo_boanerges) === soloBoanerges;
        return matchGen && matchBoan;
      })
      .map((c) => {
        const ocupadas = durmientesPorCabana[c.id] || 0;
        const libres = Math.max(0, c.capacidad - ocupadas);
        return { cabana: c, libres };
      });
  };

  // 1. FEMENINO - Boanerges
  const femBoanCamp = campamenterosAAsignar.filter(
    (p) => p.genero.toLowerCase().startsWith("f") && (p.es_boanerges || p.es_boanergues)
  );
  const femBoanCab = prepararCabanas("f", true);
  if (femBoanCamp.length > 0 && femBoanCab.length > 0) {
    const res = distribuirProporcional(femBoanCamp, femBoanCab, edadMayoria);
    for (const c of res) {
      for (const p of [...c.asignadosMenores, ...c.asignadosMayores]) {
        updates.push({ id: p.id, cabana_id: c.id });
      }
    }
  }

  // 2. FEMENINO - Normales (incluye Boanerges si no hay cabañas exclusivas Boanerges para mujeres)
  const femNormCamp = campamenterosAAsignar.filter((p) => {
    const esFem = p.genero.toLowerCase().startsWith("f");
    const esBoan = Boolean(p.es_boanerges || p.es_boanergues);
    // Si es Boanerges pero no hubo cabañas exclusivas Boanerges femeninas, entra en las normales
    if (esFem && esBoan && femBoanCab.length === 0) return true;
    return esFem && !esBoan;
  });
  const femNormCab = prepararCabanas("f", false);
  if (femNormCamp.length > 0) {
    const res = distribuirProporcional(femNormCamp, femNormCab, edadMayoria);
    for (const c of res) {
      for (const p of [...c.asignadosMenores, ...c.asignadosMayores]) {
        updates.push({ id: p.id, cabana_id: c.id });
      }
    }
  }

  // 3. MASCULINO - Boanerges
  const mascBoanCamp = campamenterosAAsignar.filter(
    (p) => p.genero.toLowerCase().startsWith("m") && (p.es_boanerges || p.es_boanergues)
  );
  const mascBoanCab = prepararCabanas("m", true);
  if (mascBoanCamp.length > 0 && mascBoanCab.length > 0) {
    const res = distribuirProporcional(mascBoanCamp, mascBoanCab, edadMayoria);
    for (const c of res) {
      for (const p of [...c.asignadosMenores, ...c.asignadosMayores]) {
        updates.push({ id: p.id, cabana_id: c.id });
      }
    }
  }

  // 4. MASCULINO - Normales
  const mascNormCamp = campamenterosAAsignar.filter((p) => {
    const esMasc = p.genero.toLowerCase().startsWith("m");
    const esBoan = Boolean(p.es_boanerges || p.es_boanergues);
    if (esMasc && esBoan && mascBoanCab.length === 0) return true;
    return esMasc && !esBoan;
  });
  const mascNormCab = prepararCabanas("m", false);
  if (mascNormCamp.length > 0) {
    const res = distribuirProporcional(mascNormCamp, mascNormCab, edadMayoria);
    for (const c of res) {
      for (const p of [...c.asignadosMenores, ...c.asignadosMayores]) {
        updates.push({ id: p.id, cabana_id: c.id });
      }
    }
  }

  // Construir resumen estadístico
  const mascAsignados = campamenterosAAsignar.filter((p) => p.genero.toLowerCase().startsWith("m"));
  const femAsignados = campamenterosAAsignar.filter((p) => p.genero.toLowerCase().startsWith("f"));
  const cabanasUsadasSet = new Set(updates.map((u) => u.cabana_id));

  const resumen: AsignacionResumen = {
    totalProcesados: campamenterosAAsignar.length,
    totalAsignados: updates.length,
    masculinos: {
      total: mascAsignados.length,
      menores: mascAsignados.filter((p) => calcularEdadPersona(p) < edadMayoria).length,
      mayores: mascAsignados.filter((p) => calcularEdadPersona(p) >= edadMayoria).length,
      boanerges: mascAsignados.filter((p) => p.es_boanerges || p.es_boanergues).length,
    },
    femeninos: {
      total: femAsignados.length,
      menores: femAsignados.filter((p) => calcularEdadPersona(p) < edadMayoria).length,
      mayores: femAsignados.filter((p) => calcularEdadPersona(p) >= edadMayoria).length,
      boanerges: femAsignados.filter((p) => p.es_boanerges || p.es_boanergues).length,
    },
    lideresProtegidos: lideres.length,
    cabanasUtilizadas: cabanasUsadasSet.size,
  };

  return { updates, resumen };
}

/**
 * Ejecuta la asignación en Supabase por lotes con actualización de progreso
 */
export async function guardarAsignacionesSupabase(
  updates: Array<{ id: string; cabana_id: string }>,
  onProgreso?: (actual: number, total: number) => void
): Promise<void> {
  const BATCH_SIZE = 25;
  const total = updates.length;

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);
    const promises = batch.map((u) =>
      supabase.from("inscripciones").update({ cabana_id: u.cabana_id }).eq("id", u.id)
    );

    const results = await Promise.all(promises);
    const primerError = results.find((r) => r.error);
    if (primerError && primerError.error) {
      throw primerError.error;
    }

    if (onProgreso) {
      onProgreso(Math.min(i + BATCH_SIZE, total), total);
    }
  }
}

