import { useState } from "react";
import { supabase } from "../utils/supabase";
import { FormData, initialFormData, STEPS } from "../types";

type FormErrors = Partial<Record<keyof FormData | "sig", string>>;

export function useInscripcion() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sig, setSig] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const esMayor = parseInt(form.edad, 10) >= 18;
  const visibleSteps = esMayor ? STEPS.filter((s) => s.id !== 2) : [...STEPS];

  // ── Field setter with phone formatting and age calculation ──────────────────

  const setField = (k: keyof FormData, v: string | boolean) => {
    let finalVal = v;
    let extraUpdates: Partial<FormData> = {};

    if (typeof v === "string" && ["celular","contacto1Telefono","contacto2Telefono","emergenciaTelefono"].includes(k)) {
      let sanitized = v.replace(/[^0-9+]/g, "");
      if (sanitized.includes("+")) {
        const parts = sanitized.split("+");
        sanitized = "+" + parts.join("");
      }
      sanitized = sanitized.slice(0, 14);
      finalVal = sanitized;
    }

    if (k === "fechaNacimiento" && typeof v === "string" && v) {
      const birthDate = new Date(v);
      const today = new Date();
      if (!isNaN(birthDate.getTime()) && birthDate <= today) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        if (age >= 0) {
          extraUpdates.edad = age.toString();
          setErrors((prev) => { const n = { ...prev }; delete n.edad; return n; });
        }
      }
    }

    setForm((prev) => ({ ...prev, [k]: finalVal, ...extraUpdates }));
    if (errors[k]) setErrors((prev) => { const n = { ...prev }; delete n[k]; return n; });
  };

  const handleSign = (dataUrl: string | null) => {
    setSig(dataUrl);
    if (dataUrl && errors.sig) setErrors((prev) => { const n = { ...prev }; delete n.sig; return n; });
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {};
    const today = new Date();

    if (currentStep === 1) {
      if (!form.primerNombre.trim()) newErrors.primerNombre = "El primer nombre es obligatorio";
      if (!form.apellidos.trim()) newErrors.apellidos = "El apellido es obligatorio";
      if (!form.genero) newErrors.genero = "Seleccione un genero";

      if (!form.fechaNacimiento) {
        newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
      } else {
        const bd = new Date(form.fechaNacimiento);
        if (bd > today) newErrors.fechaNacimiento = "La fecha no puede ser futura";
      }

      if (!form.edad) {
        newErrors.edad = "La edad es obligatoria";
      } else {
        const parsed = parseInt(form.edad, 10);
        if (isNaN(parsed) || parsed < 10) newErrors.edad = "Debe ser al menos 10 anios";
      }

      if (!form.duiPasaporte.trim()) newErrors.duiPasaporte = "El DUI o pasaporte es obligatorio";

      if (!form.celular.trim()) {
        newErrors.celular = "El celular es obligatorio";
      } else {
        const digits = form.celular.replace(/[^0-9]/g, "");
        if (digits.length < 8) newErrors.celular = "Minimo 8 digitos";
      }

      if (!form.tipoPago) newErrors.tipoPago = "Seleccione un tipo de pago";
    }

    if (currentStep === 2) {
      if (esMayor) return true;
      if (!form.contacto1Nombres.trim()) newErrors.contacto1Nombres = "El nombre es obligatorio";
      if (!form.contacto1Apellidos.trim()) newErrors.contacto1Apellidos = "El apellido es obligatorio";
      if (!form.contacto1Relacion.trim()) newErrors.contacto1Relacion = "La relacion es obligatoria";

      if (!form.contacto1Telefono.trim()) {
        newErrors.contacto1Telefono = "El telefono es obligatorio";
      } else {
        const digits = form.contacto1Telefono.replace(/[^0-9]/g, "");
        if (digits.length < 8) newErrors.contacto1Telefono = "Minimo 8 digitos";
      }

      if (form.contacto2Telefono.trim()) {
        const digits = form.contacto2Telefono.replace(/[^0-9]/g, "");
        if (digits.length < 8) newErrors.contacto2Telefono = "Minimo 8 digitos";
      }
    }

    if (currentStep === 3) {
      if (!form.emergenciaNombres.trim()) newErrors.emergenciaNombres = "El nombre es obligatorio";
      if (!form.emergenciaApellidos.trim()) newErrors.emergenciaApellidos = "El apellido es obligatorio";
      if (!form.emergenciaRelacion.trim()) newErrors.emergenciaRelacion = "La relacion es obligatoria";

      if (!form.emergenciaTelefono.trim()) {
        newErrors.emergenciaTelefono = "El telefono es obligatorio";
      } else {
        const digits = form.emergenciaTelefono.replace(/[^0-9]/g, "");
        if (digits.length < 8) newErrors.emergenciaTelefono = "Minimo 8 digitos";
      }
    }

    if (currentStep === 4) {
      if (!form.declaranteNombre.trim()) newErrors.declaranteNombre = "El nombre es obligatorio";
      if (!form.declaranteDui.trim()) newErrors.declaranteDui = "El DUI es obligatorio";
      if (!form.aceptaTerminos) newErrors.aceptaTerminos = "Debe aceptar los terminos";
    }

    if (currentStep === 5) {
      if (!sig) newErrors.sig = "La firma es obligatoria para enviar la inscripcion";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const base64ToBlob = (base64Data: string): Blob => {
    const arr = base64Data.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmit = async () => {
    if (!sig) {
      setErrors((prev) => ({ ...prev, sig: "La firma es obligatoria para enviar la inscripcion" }));
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const blob = base64ToBlob(sig);
      const sanitizedNombre = form.primerNombre.trim().replace(/[^a-zA-Z0-9]/g, "_");
      const sanitizedApellido = form.apellidos.trim().replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `firma_${sanitizedNombre}_${sanitizedApellido}_${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from("firmas")
        .upload(fileName, blob, { contentType: "image/png", cacheControl: "3600", upsert: false });

      if (uploadError) throw new Error(`Error al subir la firma: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage.from("firmas").getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("inscripciones").insert([{
        primer_nombre: form.primerNombre,
        segundo_nombre: form.segundoNombre || null,
        apellidos: form.apellidos,
        genero: form.genero,
        fecha_nacimiento: form.fechaNacimiento,
        edad: parseInt(form.edad, 10),
        talla_camisa: form.tallaCamisa || null,
        dui_pasaporte: form.duiPasaporte,
        celular: form.celular,
        tipo_pago: form.tipoPago,
        contacto1_nombres: esMayor ? form.primerNombre : form.contacto1Nombres,
        contacto1_apellidos: esMayor ? form.apellidos : form.contacto1Apellidos,
        contacto1_relacion: esMayor ? "Mismo" : form.contacto1Relacion,
        contacto1_telefono: esMayor ? form.celular : form.contacto1Telefono,
        contacto2_nombres: esMayor ? null : (form.contacto2Nombres || null),
        contacto2_apellidos: esMayor ? null : (form.contacto2Apellidos || null),
        contacto2_relacion: esMayor ? null : (form.contacto2Relacion || null),
        contacto2_telefono: esMayor ? null : (form.contacto2Telefono || null),
        emergencia_nombres: form.emergenciaNombres,
        emergencia_apellidos: form.emergenciaApellidos,
        emergencia_telefono: form.emergenciaTelefono,
        emergencia_relacion: form.emergenciaRelacion,
        enfermedades: form.enfermedades || null,
        tratamiento_enfermedades: form.tratamientoEnfermedades || null,
        alergias: form.alergias || null,
        tratamiento_alergias: form.tratamientoAlergias || null,
        declarante_nombre: form.declaranteNombre,
        declarante_dui: form.declaranteDui,
        acepta_terminos: form.aceptaTerminos,
        firma_url: publicUrl,
      }]);

      if (insertError) {
        await supabase.storage.from("firmas").remove([fileName]);
        throw new Error(`Error al registrar la inscripcion: ${insertError.message}`);
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Ocurrio un error inesperado. Por favor intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Navigation ───────────────────────────────────────────────────────────────

  const next = async () => {
    if (validateStep(step)) {
      if (step === 1 && esMayor) { setStep(3); setSubmitError(null); }
      else if (step < 5) { setStep(step + 1); setSubmitError(null); }
      else { await handleSubmit(); }
    }
  };

  const back = () => {
    if (step === 3 && esMayor) { setStep(1); setSubmitError(null); setErrors({}); }
    else if (step > 1) { setStep(step - 1); setSubmitError(null); setErrors({}); }
  };

  return {
    step, form, errors, sig, submitted, isSubmitting, submitError,
    esMayor, visibleSteps,
    setField, handleSign, next, back,
  };
}
