import { useState, useEffect, useCallback } from "react";
import {
  ConfiguracionEvento,
  obtenerConfiguracionEvento,
  actualizarParametroEvento,
} from "../services/configService";
import { CONFIG_EVENTO_DEFAULT } from "../utils/constants";

export function useConfiguracionEvento() {
  const [config, setConfig] = useState<ConfiguracionEvento>(CONFIG_EVENTO_DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      const conf = await obtenerConfiguracionEvento(forceRefresh);
      setConfig(conf);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar la configuración");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar(false);
  }, [cargar]);

  const actualizarParametro = useCallback(
    async (clave: string, valor: string): Promise<boolean> => {
      const ok = await actualizarParametroEvento(clave, valor);
      if (ok) {
        await cargar(true);
      }
      return ok;
    },
    [cargar]
  );

  return {
    config,
    loading,
    error,
    recargar: () => cargar(true),
    actualizarParametro,
  };
}

