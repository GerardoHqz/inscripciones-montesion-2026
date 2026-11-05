import { useState, useEffect } from "react";
import { sanitizeText, sanitizeOptionalText } from "../utils/sanitize";
import { toast } from "sonner";
import { supabase } from "../utils/supabase";
import { Registro } from "../types";

/** Helper to parse YYYY-MM-DD strings in local timezone instead of UTC */
const parseLocalDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
};

export function useRegistros(token: string | undefined) {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [selected, setSelected] = useState<Registro | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Registro>>({});

  const fetchRegistros = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Intentar consulta directa para asegurar todas las columnas nuevas (es_empleado, etc.)
      const { data: directData, error: directErr } = await supabase
        .from("inscripciones")
        .select("*")
        .order("created_at", { ascending: false });

      if (!directErr && directData) {
        setRegistros(directData);
        return;
      }

      // 2. Fallback a la función RPC si la consulta directa falla
      const { data, error: err } = await supabase
        .rpc("obtener_inscripciones_seguras", { p_token: token });
      if (err) throw err;
      setRegistros(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al obtener las inscripciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegistros(); }, [token]);

  // ── Edit handlers ────────────────────────────────────────────────────────────

  const handleInputChange = (field: keyof Registro, value: any) => {
    let finalVal = value;
    let extraUpdates: Partial<Registro> = {};

    if (["celular","contacto1_telefono","contacto2_telefono","emergencia_telefono"].includes(field) && typeof value === "string") {
      let sanitized = value.replace(/[^0-9+]/g, "");
      if (sanitized.includes("+")) sanitized = "+" + sanitized.split("+").join("");
      sanitized = sanitized.slice(0, 14);
      finalVal = sanitized;
    }

    if (field === "fecha_nacimiento" && typeof value === "string" && value) {
      const birthDate = parseLocalDate(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate && birthDate <= today) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        if (age >= 0) extraUpdates.edad = age;
      }
    }

    setEditForm((prev) => ({ ...prev, [field]: finalVal, ...extraUpdates }));
  };

  const handleStartEdit = () => {
    if (selected) { setEditForm({ ...selected }); setIsEditing(true); setSaveError(null); }
  };

  const handleCancelEdit = () => { setIsEditing(false); setSaveError(null); };

  const handleSaveEdit = async () => {
    if (!selected) return;
    setIsSaving(true);
    setSaveError(null);

    // Validaciones — usar bloques explícitos para garantizar el return correcto
    const fail = (msg: string) => { setSaveError(msg); setIsSaving(false); };

    if (!editForm.primer_nombre?.trim()) { fail("El primer nombre es obligatorio."); return; }
    if (!editForm.primer_apellido?.trim()) { fail("El primer apellido es obligatorio."); return; }
    if (!editForm.nacionalidad?.trim()) { fail("La nacionalidad es obligatoria."); return; }
    if (!editForm.celular?.trim()) { fail("El celular es obligatorio."); return; }
    if (!editForm.tipo_documento) { fail("El tipo de documento es obligatorio."); return; }
    if (!editForm.numero_documento?.trim()) { fail("El número de documento es obligatorio."); return; }
    if (!editForm.fecha_vencimiento_documento) {
      fail("La fecha de vencimiento del documento es obligatoria.");
      return;
    } else {
      const expiry = parseLocalDate(editForm.fecha_vencimiento_documento);
      const minExpiry = parseLocalDate("2027-05-28");
      if (!expiry || (minExpiry && expiry < minExpiry)) {
        fail("El documento debe tener al menos 6 meses de vigencia (vencer a partir del 28/05/2027).");
        return;
      }
    }
    if (!editForm.contacto1_nombres?.trim() || !editForm.contacto1_apellidos?.trim()) { fail("Nombres y apellidos del contacto 1 son obligatorios."); return; }
    if (!editForm.contacto1_telefono?.trim()) { fail("El teléfono del contacto 1 es obligatorio."); return; }
    if (!editForm.emergencia_nombres?.trim() || !editForm.emergencia_apellidos?.trim() || !editForm.emergencia_telefono?.trim()) { fail("La información de emergencia es obligatoria."); return; }
    if (!editForm.declarante_nombre?.trim() || !editForm.declarante_dui?.trim()) { fail("El nombre y DUI del declarante son obligatorios."); return; }

    const pDatos = {
      primer_nombre: sanitizeText(editForm.primer_nombre),
      segundo_nombre: sanitizeOptionalText(editForm.segundo_nombre),
      primer_apellido: sanitizeText(editForm.primer_apellido),
      segundo_apellido: sanitizeOptionalText(editForm.segundo_apellido),
      nacionalidad: sanitizeText(editForm.nacionalidad),
      genero: editForm.genero,
      fecha_nacimiento: editForm.fecha_nacimiento,
      edad: editForm.edad,
      talla_camisa: sanitizeOptionalText(editForm.talla_camisa),
      tipo_documento: editForm.tipo_documento,
      numero_documento: sanitizeText(editForm.numero_documento),
      fecha_vencimiento_documento: editForm.fecha_vencimiento_documento || null,
      celular: sanitizeText(editForm.celular),
      tipo_pago: editForm.tipo_pago || null,
      contacto1_nombres: sanitizeText(editForm.contacto1_nombres),
      contacto1_apellidos: sanitizeText(editForm.contacto1_apellidos),
      contacto1_relacion: sanitizeText(editForm.contacto1_relacion),
      contacto1_telefono: sanitizeText(editForm.contacto1_telefono),
      contacto1_dui: sanitizeOptionalText(editForm.contacto1_dui),
      contacto1_dui_vencimiento: editForm.contacto1_dui_vencimiento || null,
      contacto2_nombres: sanitizeOptionalText(editForm.contacto2_nombres),
      contacto2_apellidos: sanitizeOptionalText(editForm.contacto2_apellidos),
      contacto2_relacion: sanitizeOptionalText(editForm.contacto2_relacion),
      contacto2_telefono: sanitizeOptionalText(editForm.contacto2_telefono),
      contacto2_dui: sanitizeOptionalText(editForm.contacto2_dui),
      contacto2_dui_vencimiento: editForm.contacto2_dui_vencimiento || null,
      emergencia_nombres: sanitizeText(editForm.emergencia_nombres),
      emergencia_apellidos: sanitizeText(editForm.emergencia_apellidos),
      emergencia_telefono: sanitizeText(editForm.emergencia_telefono),
      emergencia_relacion: sanitizeText(editForm.emergencia_relacion),
      enfermedades: sanitizeOptionalText(editForm.enfermedades),
      tratamiento_enfermedades: sanitizeOptionalText(editForm.tratamiento_enfermedades),
      alergias: sanitizeOptionalText(editForm.alergias),
      tratamiento_alergias: sanitizeOptionalText(editForm.tratamiento_alergias),
      declarante_nombre: sanitizeText(editForm.declarante_nombre),
      declarante_dui: sanitizeText(editForm.declarante_dui),
      numero_factura: sanitizeOptionalText(editForm.numero_factura),
      es_empleado: editForm.es_empleado !== undefined ? Boolean(editForm.es_empleado) : Boolean(selected.es_empleado),
      es_lider: editForm.es_lider !== undefined ? Boolean(editForm.es_lider) : Boolean(selected.es_lider),
      es_boanerges: editForm.es_boanerges !== undefined 
        ? Boolean(editForm.es_boanerges) 
        : Boolean(selected.es_boanerges),
      es_exclusion: editForm.es_exclusion !== undefined ? Boolean(editForm.es_exclusion) : Boolean(selected.es_exclusion),
    };

    try {
      // 1. Intentar guardar directamente en la tabla inscripciones (para incluir todos los campos nuevos)
      const { error: directErr } = await supabase
        .from("inscripciones")
        .update(pDatos)
        .eq("id", selected.id);

      if (directErr) {
        console.warn("Actualización directa falló, intentando RPC:", directErr.message);
        
        // 2. Intentar mediante la función RPC segura
        const { error: rpcErr } = await supabase
          .rpc("guardar_edicion_segura", {
            p_token: token,
            p_id: selected.id,
            p_datos: pDatos
          });

        if (rpcErr) {
          console.warn("RPC guardar_edicion_segura falló, intentando sin columnas opcionales adicionales:", rpcErr.message);
          
          // 3. Fallback de seguridad eliminando columnas que podrían no existir aún en la BD del cliente
          const { contacto1_dui, contacto1_dui_vencimiento, contacto2_dui, contacto2_dui_vencimiento, numero_factura, ...legacyDatos } = pDatos as any;
          const { error: legacyErr } = await supabase
            .from("inscripciones")
            .update(legacyDatos)
            .eq("id", selected.id);

          if (legacyErr) {
            throw new Error(legacyErr.message || directErr.message || rpcErr.message);
          }
        }
      }

      const updated = { ...selected, ...editForm } as Registro;
      setRegistros((prev) => prev.map((r) => (r.id === selected.id ? updated : r)));
      setSelected(updated);
      setIsEditing(false);
      toast.success("¡Ficha actualizada con éxito!");
    } catch (err: any) {
      console.error("Error al guardar cambios de ficha:", err);
      setSaveError(err.message || "Ocurrió un error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmarPago = async (
    id: string,
    tipoPago: 'completo' | 'medio pago' | 'media beca' | 'becado',
    numeroFactura: string,
    opciones?: {
      es_empleado?: boolean;
      es_lider?: boolean;
      es_boanerges?: boolean;
      es_exclusion?: boolean;
    } | boolean
  ) => {
    if (!numeroFactura.trim()) {
      throw new Error("El número de factura es obligatorio.");
    }

    const facturaClean = numeroFactura.trim();
    const flagsObj = typeof opciones === "boolean" 
      ? { es_empleado: opciones } 
      : (opciones || {});

    const esBoanergesVal = Boolean(flagsObj.es_boanerges ?? (flagsObj as any).es_boanergues);

    // Asegurar que enviamos únicamente columnas existentes en la tabla inscripciones
    const updateData = {
      tipo_pago: tipoPago,
      numero_factura: facturaClean,
      es_empleado: Boolean(flagsObj.es_empleado),
      es_lider: Boolean(flagsObj.es_lider),
      es_boanerges: esBoanergesVal,
      es_exclusion: Boolean(flagsObj.es_exclusion)
    };

    const { error: directErr } = await supabase
      .from("inscripciones")
      .update(updateData)
      .eq("id", id);

    if (directErr) {
      console.warn("Actualización directa falló, intentando RPC:", directErr.message);

      // Si falla, intentar RPC
      const { error: rpcErr } = await supabase
        .rpc("confirmar_pago_seguro", {
          p_token: token,
          p_id: id,
          p_tipo_pago: tipoPago,
          p_numero_factura: facturaClean,
          p_es_empleado: flagsObj.es_empleado ?? false
        });

      if (rpcErr) {
        throw new Error(directErr.message || rpcErr.message);
      }
    }

    setRegistros((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, ...updateData }
          : r
      )
    );
    setSelected((prev) =>
      prev && prev.id === id
        ? { ...prev, ...updateData }
        : prev
    );
    toast.success("Pago y distintivos guardados exitosamente.");
  };

  return {
    registros, loading, error, fetchRegistros,
    selected, setSelected,
    isEditing, isSaving, saveError, editForm,
    handleInputChange, handleStartEdit, handleCancelEdit, handleSaveEdit,
    confirmarPago,
  };
}
