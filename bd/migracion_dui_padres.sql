-- =========================================================================
-- SCRIPT DE MIGRACIÓN: REGISTRO DE DUI DE PADRES/TUTORES
-- Proyecto: Inscripción Monte Sión 2026
-- Instrucciones: Ejecutar este script en el Editor SQL de Supabase.
-- =========================================================================

-- 1. AGREGAR COLUMNAS PARA EL DUI DE LOS ENCARGADOS
ALTER TABLE public.inscripciones ADD COLUMN IF NOT EXISTS contacto1_dui varchar(50);
ALTER TABLE public.inscripciones ADD COLUMN IF NOT EXISTS contacto2_dui varchar(50);

COMMENT ON COLUMN public.inscripciones.contacto1_dui IS 'Documento de identidad del primer contacto/tutor (obligatorio para menores de edad)';
COMMENT ON COLUMN public.inscripciones.contacto2_dui IS 'Documento de identidad del segundo contacto/tutor (opcional)';

-- 2. ACTUALIZACIÓN OPCIONAL DE LA FUNCIÓN RPC `guardar_edicion_segura`
-- Si su función `guardar_edicion_segura` actualiza las columnas de forma explícita,
-- deberá actualizarla en su base de datos con la siguiente definición:

CREATE OR REPLACE FUNCTION public.guardar_edicion_segura(
    p_token text,
    p_id uuid,
    p_datos jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validar que exista una sesión activa con el token provisto (suponiendo tabla sesiones_admin o similar)
    -- Si utiliza otro método de validación, por favor mantenga la lógica de autenticación que ya tiene.
    
    -- Actualización de los datos del registro en la tabla `inscripciones`
    UPDATE public.inscripciones
    SET
        primer_nombre = p_datos->>'primer_nombre',
        segundo_nombre = NULLIF(p_datos->>'segundo_nombre', ''),
        primer_apellido = p_datos->>'primer_apellido',
        segundo_apellido = NULLIF(p_datos->>'segundo_apellido', ''),
        nacionalidad = p_datos->>'nacionalidad',
        genero = p_datos->>'genero',
        fecha_nacimiento = (p_datos->>'fecha_nacimiento')::date,
        edad = (p_datos->>'edad')::integer,
        talla_camisa = NULLIF(p_datos->>'talla_camisa', ''),
        tipo_documento = p_datos->>'tipo_documento',
        numero_documento = p_datos->>'numero_documento',
        fecha_vencimiento_documento = NULLIF(p_datos->>'fecha_vencimiento_documento', '')::date,
        celular = p_datos->>'celular',
        tipo_pago = NULLIF(p_datos->>'tipo_pago', ''),
        
        -- Datos de contacto actualizados
        contacto1_nombres = p_datos->>'contacto1_nombres',
        contacto1_apellidos = p_datos->>'contacto1_apellidos',
        contacto1_relacion = p_datos->>'contacto1_relacion',
        contacto1_telefono = p_datos->>'contacto1_telefono',
        contacto1_dui = NULLIF(p_datos->>'contacto1_dui', ''), -- NUEVA COLUMNA
        
        contacto2_nombres = NULLIF(p_datos->>'contacto2_nombres', ''),
        contacto2_apellidos = NULLIF(p_datos->>'contacto2_apellidos', ''),
        contacto2_relacion = NULLIF(p_datos->>'contacto2_relacion', ''),
        contacto2_telefono = NULLIF(p_datos->>'contacto2_telefono', ''),
        contacto2_dui = NULLIF(p_datos->>'contacto2_dui', ''),   -- NUEVA COLUMNA
        
        emergencia_nombres = p_datos->>'emergencia_nombres',
        emergencia_apellidos = p_datos->>'emergencia_apellidos',
        emergencia_telefono = p_datos->>'emergencia_telefono',
        emergencia_relacion = p_datos->>'emergencia_relacion',
        
        enfermedades = NULLIF(p_datos->>'enfermedades', ''),
        tratamiento_enfermedades = NULLIF(p_datos->>'tratamiento_enfermedades', ''),
        alergias = NULLIF(p_datos->>'alergias', ''),
        tratamiento_alergias = NULLIF(p_datos->>'tratamiento_alergias', ''),
        
        declarante_nombre = p_datos->>'declarante_nombre',
        declarante_dui = p_datos->>'declarante_dui',
        numero_factura = NULLIF(p_datos->>'numero_factura', '')
    WHERE id = p_id;
END;
$$;
