import { useState } from "react";
import { sanitizeText, sanitizeOptionalText } from "../utils/sanitize";
import { supabase } from "../utils/supabase";
import { FormData, initialFormData, STEPS } from "../types";
import { nacionalidades, relaciones } from "../utils/constants";
import { useConfiguracionEvento } from "./useConfiguracionEvento";

type FormErrors = Partial<Record<keyof FormData | "sig", string>>;

/** Helper to parse YYYY-MM-DD strings in local timezone instead of UTC */
const parseLocalDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
};

export function useInscripcion() {
  const { config } = useConfiguracionEvento();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [sig, setSig] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const esMayor = parseInt(form.edad, 10) >= config.edadMayoriaEdad;
  const visibleSteps = esMayor ? STEPS.filter((s) => (s.id as number) !== 2) : STEPS;


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
      const birthDate = parseLocalDate(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate && birthDate <= today) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        if (age >= 0) {
          extraUpdates.edad = age.toString();
          setErrors((prev) => { const n = { ...prev }; delete n.edad; return n; });
          if (age < 18) {
            extraUpdates.tipoDocumento = "PASAPORTE";
          }
        }
      }
    }

    if (k === "edad" && typeof v === "string" && v) {
      const parsed = parseInt(v, 10);
      if (!isNaN(parsed) && parsed < 18) {
        extraUpdates.tipoDocumento = "PASAPORTE";
      }
    }

    setForm((prev) => {
      const nextForm = { ...prev, [k]: finalVal, ...extraUpdates };
      const isAdult = parseInt(nextForm.edad, 10) >= 18;
      if (isAdult) {
        const fullCamperName = [nextForm.primerNombre, nextForm.segundoNombre, nextForm.primerApellido, nextForm.segundoApellido]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        nextForm.declaranteNombre = fullCamperName;
        nextForm.declaranteDui = nextForm.numeroDocumento || "";
      } else {
        // MENOR DE EDAD: El declarante se llena con el Contacto 1 (Padre/Madre/Tutor)
        const fullContacto1Name = [nextForm.contacto1Nombres, nextForm.contacto1Apellidos]
          .filter(Boolean)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();

        if (fullContacto1Name) {
          nextForm.declaranteNombre = fullContacto1Name;
        }
        if (nextForm.contacto1Dui) {
          nextForm.declaranteDui = nextForm.contacto1Dui;
        }

        // El contacto de emergencia se auto-llena por defecto con Contacto 1
        if (!prev.emergenciaNombres || prev.emergenciaNombres === prev.contacto1Nombres) {
          nextForm.emergenciaNombres = nextForm.contacto1Nombres;
        }
        if (!prev.emergenciaApellidos || prev.emergenciaApellidos === prev.contacto1Apellidos) {
          nextForm.emergenciaApellidos = nextForm.contacto1Apellidos;
        }
        if (!prev.emergenciaTelefono || prev.emergenciaTelefono === prev.contacto1Telefono) {
          nextForm.emergenciaTelefono = nextForm.contacto1Telefono;
        }
        if (!prev.emergenciaRelacion || prev.emergenciaRelacion === prev.contacto1Relacion) {
          nextForm.emergenciaRelacion = nextForm.contacto1Relacion;
        }
      }
      return nextForm;
    });

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
    today.setHours(0, 0, 0, 0);

    if (currentStep === 1) {
      if (!form.primerNombre.trim()) newErrors.primerNombre = "El primer nombre es obligatorio";
      if (!form.primerApellido.trim()) newErrors.primerApellido = "El primer apellido es obligatorio";
      
      if (!form.nacionalidad.trim()) {
        newErrors.nacionalidad = "La nacionalidad es obligatoria";
      } else if (!nacionalidades.includes(form.nacionalidad)) {
        newErrors.nacionalidad = "Debe elegir de la lista";
      }

      if (!form.genero) newErrors.genero = "Seleccione un género";

      if (!form.fechaNacimiento) {
        newErrors.fechaNacimiento = "La fecha de nacimiento es obligatoria";
      } else {
        const bd = parseLocalDate(form.fechaNacimiento);
        if (!bd) {
          newErrors.fechaNacimiento = "Fecha inválida";
        } else if (bd > today) {
          newErrors.fechaNacimiento = "La fecha no puede ser futura";
        }
      }

      if (!form.edad) {
        newErrors.edad = "La edad es obligatoria";
      } else {
        const parsed = parseInt(form.edad, 10);
        if (isNaN(parsed) || parsed < config.edadMinima) {
          newErrors.edad = `Debe tener al menos ${config.edadMinima} años de edad`;
        }
      }

      if (!form.tipoDocumento) {
        newErrors.tipoDocumento = "Seleccione el tipo de documento";
      }

      if (!form.numeroDocumento.trim()) {
        newErrors.numeroDocumento = "El número de documento es obligatorio";
      }

      if (!form.fechaVencimientoDocumento) {
        newErrors.fechaVencimientoDocumento = "La fecha de vencimiento es obligatoria";
      } else {
        const bd = parseLocalDate(form.fechaVencimientoDocumento);
        const minExpiry = parseLocalDate(config.fechaMinimaVencimientoDocumento);
        if (!bd) {
          newErrors.fechaVencimientoDocumento = "Fecha inválida";
        } else if (minExpiry && bd < minExpiry) {
          const parts = config.fechaMinimaVencimientoDocumento.split("-");
          const formatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : config.fechaMinimaVencimientoDocumento;
          newErrors.fechaVencimientoDocumento = `El documento debe tener al menos ${config.mesesVigenciaMinima} meses de vigencia (vencer a partir del ${formatted})`;
        }
      }

      if (!form.celular.trim()) {
        newErrors.celular = "El celular es obligatorio";
      } else {
        const digits = form.celular.replace(/[^0-9]/g, "");
        if (digits.length < 8) newErrors.celular = "Mínimo 8 dígitos";
      }
    }

    if (currentStep === 2) {
      if (esMayor) return true;
      if (!form.contacto1Nombres.trim()) newErrors.contacto1Nombres = "El nombre es obligatorio";
      if (!form.contacto1Apellidos.trim()) newErrors.contacto1Apellidos = "El apellido es obligatorio";
      
      if (!form.contacto1Relacion.trim()) {
        newErrors.contacto1Relacion = "La relación es obligatoria";
      } else if (!relaciones.includes(form.contacto1Relacion)) {
        newErrors.contacto1Relacion = "Debe elegir de la lista";
      }

      if (!form.contacto1Telefono.trim()) {
        newErrors.contacto1Telefono = "El teléfono es obligatorio";
      } else {
        const digits = form.contacto1Telefono.replace(/[^0-9]/g, "");
        if (digits.length < 8) newErrors.contacto1Telefono = "Mínimo 8 dígitos";
      }

      if (!form.contacto1Dui.trim()) {
        newErrors.contacto1Dui = "El DUI del responsable es obligatorio";
      } else {
        const digits = form.contacto1Dui.replace(/[^0-9]/g, "");
        if (digits.length < 8) newErrors.contacto1Dui = "El DUI debe tener al menos 8-9 dígitos";
      }

      if (!form.contacto1DuiVencimiento) {
        newErrors.contacto1DuiVencimiento = "La fecha de vencimiento es obligatoria";
      } else if (form.contacto1DuiVencimiento < "2027-01-01") {
        newErrors.contacto1DuiVencimiento = "El DUI debe estar vigente y cubrir todo diciembre 2026 (vencer a partir de enero 2027)";
      }

      if (form.contacto2Telefono.trim()) {
        const digits = form.contacto2Telefono.replace(/[^0-9]/g, "");
        if (digits.length < 8) newErrors.contacto2Telefono = "Mínimo 8 dígitos";
      }

      if (form.contacto2Relacion.trim() && !relaciones.includes(form.contacto2Relacion)) {
        newErrors.contacto2Relacion = "Debe elegir de la lista";
      }

      if (form.contacto2DuiVencimiento && form.contacto2DuiVencimiento < "2027-01-01") {
        newErrors.contacto2DuiVencimiento = "El DUI debe estar vigente y cubrir todo diciembre 2026 (vencer a partir de enero 2027)";
      }
    }

    if (currentStep === 3) {
      if (!form.emergenciaNombres.trim()) newErrors.emergenciaNombres = "El nombre es obligatorio";
      if (!form.emergenciaApellidos.trim()) newErrors.emergenciaApellidos = "El apellido es obligatorio";
      
      if (!form.emergenciaRelacion.trim()) {
        newErrors.emergenciaRelacion = "La relación es obligatoria";
      } else if (!relaciones.includes(form.emergenciaRelacion)) {
        newErrors.emergenciaRelacion = "Debe elegir de la lista";
      }

      if (!form.emergenciaTelefono.trim()) {
        newErrors.emergenciaTelefono = "El teléfono es obligatorio";
      } else {
        const digits = form.emergenciaTelefono.replace(/[^0-9]/g, "");
        if (digits.length < 8) newErrors.emergenciaTelefono = "Mínimo 8 dígitos";
      }
    }

    if (currentStep === 4) {
      if (!form.declaranteNombre.trim()) newErrors.declaranteNombre = "El nombre es obligatorio";
      if (!form.declaranteDui.trim()) {
        newErrors.declaranteDui = "El DUI del declarante es obligatorio";
      } else {
        const digits = form.declaranteDui.replace(/[^0-9]/g, "");
        if (digits.length < 8) newErrors.declaranteDui = "El DUI debe tener al menos 8-9 dígitos";
      }
      if (!form.aceptaTerminos) newErrors.aceptaTerminos = "Debe aceptar los términos y condiciones";
    }

    if (currentStep === 5) {
      if (!sig) newErrors.sig = "La firma es obligatoria para enviar la inscripción";
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

  const checkCuposMenores = async (): Promise<boolean> => {
    // 1. Conteo directo exacto en la tabla inscripciones
    const { count, error: countErr } = await supabase
      .from("inscripciones")
      .select("id", { count: "exact", head: true })
      .lt("edad", config.edadMayoriaEdad);

    if (!countErr && count !== null) {
      return count >= config.cupoMaximoMenores;
    }

    // 2. Fallback mediante RPC de Supabase
    try {
      const { data, error } = await supabase.rpc("obtener_cupos_menores");
      if (!error && data && data.length > 0) {
        const row = data[0];
        if (typeof row.total_menores === "number") return row.total_menores >= config.cupoMaximoMenores;
        if (typeof row.cupos_disponibles === "number") return row.cupos_disponibles <= 0;
        if (typeof row.agotado === "boolean") return row.agotado;
      }
    } catch (e) {
      console.warn("RPC obtener_cupos_menores no disponible o falló:", e);
    }

    return false;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (!config.inscripcionesActivas) {
        throw new Error("⚠️ Las inscripciones se encuentran cerradas en este momento.");
      }

      const esMenorEdad = parseInt(form.edad, 10) < config.edadMayoriaEdad;
      if (esMenorEdad) {
        const estaAgotado = await checkCuposMenores();
        if (estaAgotado) {
          throw new Error("⚠️ Cupos para menores de edad agotados");
        }
      }

      let publicUrl = "";
      let uploadedFileName = "";
      if (sig) {
        try {
          const blob = base64ToBlob(sig);
          const sanitizedNombre = form.primerNombre.trim().replace(/[^a-zA-Z0-9]/g, "_");
          const sanitizedApellido = form.primerApellido.trim().replace(/[^a-zA-Z0-9]/g, "_");
          uploadedFileName = `firma_${sanitizedNombre}_${sanitizedApellido}_${Date.now()}.png`;

          const { error: uploadError } = await supabase.storage
            .from("firmas")
            .upload(uploadedFileName, blob, { contentType: "image/png", cacheControl: "3600", upsert: false });

          if (!uploadError) {
            const { data: { publicUrl: url } } = supabase.storage.from("firmas").getPublicUrl(uploadedFileName);
            publicUrl = url;
          }
        } catch (e) {
          console.error("Error al subir firma opcional:", e);
        }
      }

      const formattedFechaNacimiento = form.fechaNacimiento;
      const formattedFechaVencimiento = form.fechaVencimientoDocumento || null;

      const payload: any = {
        primer_nombre: sanitizeText(form.primerNombre),
        segundo_nombre: sanitizeOptionalText(form.segundoNombre),
        primer_apellido: sanitizeText(form.primerApellido),
        segundo_apellido: sanitizeOptionalText(form.segundoApellido),
        nacionalidad: sanitizeText(form.nacionalidad),
        fecha_nacimiento: formattedFechaNacimiento,
        edad: parseInt(form.edad, 10),
        genero: form.genero,
        talla_camisa: sanitizeOptionalText(form.tallaCamisa),
        tipo_documento: form.tipoDocumento,
        numero_documento: sanitizeText(form.numeroDocumento),
        fecha_vencimiento_documento: formattedFechaVencimiento,
        celular: sanitizeText(form.celular),
        tipo_pago: null,
        numero_factura: null,
        contacto1_nombres: esMayor ? sanitizeText(form.primerNombre) : sanitizeText(form.contacto1Nombres),
        contacto1_apellidos: esMayor ? sanitizeText(form.primerApellido) : sanitizeText(form.contacto1Apellidos),
        contacto1_relacion: esMayor ? "MISMO" : sanitizeText(form.contacto1Relacion),
        contacto1_telefono: esMayor ? sanitizeText(form.celular) : sanitizeText(form.contacto1Telefono),
        contacto1_dui: esMayor ? null : sanitizeOptionalText(form.contacto1Dui),
        contacto1_dui_vencimiento: esMayor ? null : sanitizeOptionalText(form.contacto1DuiVencimiento),
        contacto2_nombres: esMayor ? null : sanitizeOptionalText(form.contacto2Nombres),
        contacto2_apellidos: esMayor ? null : sanitizeOptionalText(form.contacto2Apellidos),
        contacto2_relacion: esMayor ? null : sanitizeOptionalText(form.contacto2Relacion),
        contacto2_telefono: esMayor ? null : sanitizeOptionalText(form.contacto2Telefono),
        contacto2_dui: esMayor ? null : sanitizeOptionalText(form.contacto2Dui),
        contacto2_dui_vencimiento: esMayor ? null : sanitizeOptionalText(form.contacto2DuiVencimiento),
        emergencia_nombres: sanitizeText(form.emergenciaNombres),
        emergencia_apellidos: sanitizeText(form.emergenciaApellidos),
        emergencia_telefono: sanitizeText(form.emergenciaTelefono),
        emergencia_relacion: sanitizeText(form.emergenciaRelacion),
        enfermedades: sanitizeOptionalText(form.enfermedades),
        tratamiento_enfermedades: sanitizeOptionalText(form.tratamientoEnfermedades),
        alergias: sanitizeOptionalText(form.alergias),
        tratamiento_alergias: sanitizeOptionalText(form.tratamientoAlergias),
        declarante_nombre: sanitizeText(form.declaranteNombre),
        declarante_dui: sanitizeText(form.declaranteDui),
        acepta_terminos: form.aceptaTerminos,
        firma_url: publicUrl,
      };

      let { error: insertError } = await supabase.from("inscripciones").insert([payload]);

      // Fallback si la base de datos de Supabase aun no tiene las columnas agregadas
      if (insertError && (insertError.message?.includes("contacto1_dui_vencimiento") || insertError.message?.includes("schema cache"))) {
        console.warn("Supabase no tiene aún las columnas de vencimiento de DUI, reintentando inserción en modo compatible:", insertError.message);
        const { contacto1_dui_vencimiento, contacto2_dui_vencimiento, ...fallbackPayload } = payload;
        const fallbackResult = await supabase.from("inscripciones").insert([fallbackPayload]);
        insertError = fallbackResult.error;
      }

      if (insertError) {
        if (uploadedFileName) {
          await supabase.storage.from("firmas").remove([uploadedFileName]);
        }
        if (insertError.code === "23505" || insertError.message?.includes("duplicate") || insertError.message?.includes("idx_inscripciones_numero_documento")) {
          throw new Error("El número de documento ya está registrado para otra inscripción.");
        }
        throw new Error(`Error al registrar la inscripción: ${insertError.message}`);
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Ocurrió un error inesperado. Por favor intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Navigation ───────────────────────────────────────────────────────────────

  const next = async () => {
    if (!validateStep(step)) return;

    if (step === 1) {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const esMenorEdad = parseInt(form.edad, 10) < 18;
        if (esMenorEdad) {
          const estaAgotado = await checkCuposMenores();
          if (estaAgotado) {
            setSubmitError("⚠️ Cupos para menores de edad agotados");
            return;
          }
        }

        const { data, error } = await supabase
          .from("inscripciones")
          .select("id")
          .eq("numero_documento", form.numeroDocumento.trim())
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setErrors((prev) => ({
            ...prev,
            numeroDocumento: "Este número de documento ya está registrado",
          }));
          return;
        }
      } catch (err: any) {
        console.error("Error al verificar documento:", err);
        setSubmitError(err.message || "Error al verificar el documento. Por favor, intente de nuevo.");
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    if (step === 1 && esMayor) {
      setStep(3);
      setSubmitError(null);
    } else if (step < 4) {
      setStep(step + 1);
      setSubmitError(null);
    } else {
      await handleSubmit();
    }
  };

  const back = () => {
    if (step === 3 && esMayor) { setStep(1); setSubmitError(null); setErrors({}); }
    else if (step > 1) { setStep(step - 1); setSubmitError(null); setErrors({}); }
  };

  return {
    step, form, errors, sig, submitted, isSubmitting, submitError, setSubmitError,
    esMayor, visibleSteps, config,
    setField, handleSign, next, back,
  };
}

