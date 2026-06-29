import { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { Registro } from "../types";

export function useRegistros() {
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
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from("inscripciones")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setRegistros(data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al obtener las inscripciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegistros(); }, []);

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

    // Basic validations
    if (!editForm.primer_nombre?.trim()) return setSaveError("El primer nombre es obligatorio."), setIsSaving(false), undefined;
    if (!editForm.apellidos?.trim()) return setSaveError("El apellido es obligatorio."), setIsSaving(false), undefined;
    if (!editForm.celular?.trim()) return setSaveError("El celular es obligatorio."), setIsSaving(false), undefined;
    if (!editForm.dui_pasaporte?.trim()) return setSaveError("El DUI o Pasaporte es obligatorio."), setIsSaving(false), undefined;
    if (!editForm.contacto1_nombres?.trim() || !editForm.contacto1_apellidos?.trim()) return setSaveError("Nombres y apellidos del contacto 1 son obligatorios."), setIsSaving(false), undefined;
    if (!editForm.contacto1_telefono?.trim()) return setSaveError("El telefono del contacto 1 es obligatorio."), setIsSaving(false), undefined;
    if (!editForm.emergencia_nombres?.trim() || !editForm.emergencia_apellidos?.trim() || !editForm.emergencia_telefono?.trim()) return setSaveError("La informacion de contacto de emergencia es obligatoria."), setIsSaving(false), undefined;
    if (!editForm.declarante_nombre?.trim() || !editForm.declarante_dui?.trim()) return setSaveError("El nombre y DUI del declarante son obligatorios."), setIsSaving(false), undefined;

    try {
      const { error: updateErr } = await supabase
        .from("inscripciones")
        .update({
          primer_nombre: editForm.primer_nombre?.trim() || "",
          segundo_nombre: editForm.segundo_nombre?.trim() || null,
          apellidos: editForm.apellidos?.trim() || "",
          genero: editForm.genero,
          fecha_nacimiento: editForm.fecha_nacimiento,
          edad: editForm.edad,
          talla_camisa: editForm.talla_camisa || null,
          dui_pasaporte: editForm.dui_pasaporte?.trim() || "",
          celular: editForm.celular?.trim() || "",
          tipo_pago: editForm.tipo_pago,
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
        })
        .eq("id", selected.id);

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

  return {
    registros, loading, error, fetchRegistros,
    selected, setSelected,
    isEditing, isSaving, saveError, editForm,
    handleInputChange, handleStartEdit, handleCancelEdit, handleSaveEdit,
  };
}
