import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Registro } from "../types";

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
      const birthDate = new Date(value);
      const today = new Date();
      if (!isNaN(birthDate.getTime()) && birthDate <= today) {
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
    if (!editForm.contacto1_nombres?.trim() || !editForm.contacto1_apellidos?.trim()) { fail("Nombres y apellidos del contacto 1 son obligatorios."); return; }
    if (!editForm.contacto1_telefono?.trim()) { fail("El teléfono del contacto 1 es obligatorio."); return; }
    if (!editForm.emergencia_nombres?.trim() || !editForm.emergencia_apellidos?.trim() || !editForm.emergencia_telefono?.trim()) { fail("La información de emergencia es obligatoria."); return; }
    if (!editForm.declarante_nombre?.trim() || !editForm.declarante_dui?.trim()) { fail("El nombre y DUI del declarante son obligatorios."); return; }

    try {
      const { error: updateErr } = await supabase
        .rpc("guardar_edicion_segura", {
          p_token: token,
          p_id: selected.id,
          p_datos: {
            primer_nombre: editForm.primer_nombre?.trim() || "",
            segundo_nombre: editForm.segundo_nombre?.trim() || null,
            primer_apellido: editForm.primer_apellido?.trim() || "",
            segundo_apellido: editForm.segundo_apellido?.trim() || null,
            nacionalidad: editForm.nacionalidad?.trim() || "",
            genero: editForm.genero,
            fecha_nacimiento: editForm.fecha_nacimiento,
            edad: editForm.edad,
            talla_camisa: editForm.talla_camisa || null,
            tipo_documento: editForm.tipo_documento,
            numero_documento: editForm.numero_documento?.trim() || "",
            fecha_vencimiento_documento: editForm.fecha_vencimiento_documento || null,
            celular: editForm.celular?.trim() || "",
            tipo_pago: editForm.tipo_pago || null,
            contacto1_nombres: editForm.contacto1_nombres?.trim() || "",
            contacto1_apellidos: editForm.contacto1_apellidos?.trim() || "",
            contacto1_relacion: editForm.contacto1_relacion?.trim() || "",
            contacto1_telefono: editForm.contacto1_telefono?.trim() || "",
            contacto2_nombres: editForm.contacto2_nombres?.trim() || null,
            contacto2_apellidos: editForm.contacto2_apellidos?.trim() || null,
            contacto2_relacion: editForm.contacto2_relacion?.trim() || null,
            contacto2_telefono: editForm.contacto2_telefono?.trim() || null,
            emergencia_nombres: editForm.emergencia_nombres?.trim() || "",
            emergencia_apellidos: editForm.emergencia_apellidos?.trim() || "",
            emergencia_telefono: editForm.emergencia_telefono?.trim() || "",
            emergencia_relacion: editForm.emergencia_relacion?.trim() || "",
            enfermedades: editForm.enfermedades?.trim() || null,
            tratamiento_enfermedades: editForm.tratamiento_enfermedades?.trim() || null,
            alergias: editForm.alergias?.trim() || null,
            tratamiento_alergias: editForm.tratamiento_alergias?.trim() || null,
            declarante_nombre: editForm.declarante_nombre?.trim() || "",
            declarante_dui: editForm.declarante_dui?.trim() || "",
            numero_factura: editForm.numero_factura?.trim() || null,
          }
        });
 
       if (updateErr) throw updateErr;

      const updated = { ...selected, ...editForm } as Registro;
      setRegistros((prev) => prev.map((r) => (r.id === selected.id ? updated : r)));
      setSelected(updated);
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setSaveError(err.message || "Ocurrio un error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmarPago = async (id: string, tipoPago: 'completo' | 'medio pago', numeroFactura: string) => {
    if (!numeroFactura.trim()) {
      throw new Error("El número de factura es obligatorio.");
    }
    const { error: updateErr } = await supabase
      .rpc("confirmar_pago_seguro", {
        p_token: token,
        p_id: id,
        p_tipo_pago: tipoPago,
        p_numero_factura: numeroFactura.trim()
      });
 
     if (updateErr) throw updateErr;

    setRegistros((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, tipo_pago: tipoPago, numero_factura: numeroFactura.trim() }
          : r
      )
    );
    setSelected((prev) =>
      prev && prev.id === id
        ? { ...prev, tipo_pago: tipoPago, numero_factura: numeroFactura.trim() }
        : prev
    );
  };

  return {
    registros, loading, error, fetchRegistros,
    selected, setSelected,
    isEditing, isSaving, saveError, editForm,
    handleInputChange, handleStartEdit, handleCancelEdit, handleSaveEdit,
    confirmarPago,
  };
}
