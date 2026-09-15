-- =========================================================================
-- SCRIPT DE MIGRACIÓN COMPLETA PARA EDICIÓN DE FICHAS Y DASHBOARD
-- Proyecto: Inscripción Monte Sión 2026
-- INSTRUCCIONES: Copiar y ejecutar en Supabase -> SQL Editor
-- =========================================================================

-- 1. ASEGURAR QUE TODAS LAS COLUMNAS EXISTAN EN LA TABLA public.inscripciones
ALTER TABLE public.inscripciones ADD COLUMN IF NOT EXISTS contacto1_dui varchar(50);
ALTER TABLE public.inscripciones ADD COLUMN IF NOT EXISTS contacto2_dui varchar(50);
ALTER TABLE public.inscripciones ADD COLUMN IF NOT EXISTS numero_factura varchar(100);
ALTER TABLE public.inscripciones ADD COLUMN IF NOT EXISTS user_ultima_actualizacion varchar(100);

-- 2. RECREAR LA FUNCIÓN RPC DE GUARDAR EDICIÓN SEGURO
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
        
        -- Datos de contacto
        contacto1_nombres = p_datos->>'contacto1_nombres',
        contacto1_apellidos = p_datos->>'contacto1_apellidos',
        contacto1_relacion = p_datos->>'contacto1_relacion',
        contacto1_telefono = p_datos->>'contacto1_telefono',
        contacto1_dui = NULLIF(p_datos->>'contacto1_dui', ''),
        
        contacto2_nombres = NULLIF(p_datos->>'contacto2_nombres', ''),
        contacto2_apellidos = NULLIF(p_datos->>'contacto2_apellidos', ''),
        contacto2_relacion = NULLIF(p_datos->>'contacto2_relacion', ''),
        contacto2_telefono = NULLIF(p_datos->>'contacto2_telefono', ''),
        contacto2_dui = NULLIF(p_datos->>'contacto2_dui', ''),
        
        -- Emergencia
        emergencia_nombres = p_datos->>'emergencia_nombres',
        emergencia_apellidos = p_datos->>'emergencia_apellidos',
        emergencia_telefono = p_datos->>'emergencia_telefono',
        emergencia_relacion = p_datos->>'emergencia_relacion',
        
        -- Salud
        enfermedades = NULLIF(p_datos->>'enfermedades', ''),
        tratamiento_enfermedades = NULLIF(p_datos->>'tratamiento_enfermedades', ''),
        alergias = NULLIF(p_datos->>'alergias', ''),
        tratamiento_alergias = NULLIF(p_datos->>'tratamiento_alergias', ''),
        
        -- Declaración y Facturación
        declarante_nombre = p_datos->>'declarante_nombre',
        declarante_dui = p_datos->>'declarante_dui',
        numero_factura = NULLIF(p_datos->>'numero_factura', '')
    WHERE id = p_id;
END;
$$;

-- 3. RECREAR LA FUNCIÓN RPC DE OBTENER INSCRIPCIONES SEGURAS
DROP FUNCTION IF EXISTS public.obtener_inscripciones_seguras(text);
DROP FUNCTION IF EXISTS public.obtener_inscripciones_seguras(uuid);

CREATE OR REPLACE FUNCTION public.obtener_inscripciones_seguras(p_token text)
RETURNS TABLE (
    id                          uuid,
    created_at                  timestamptz,
    primer_nombre               varchar,
    segundo_nombre              varchar,
    primer_apellido             varchar,
    segundo_apellido            varchar,
    nacionalidad                varchar,
    fecha_nacimiento            date,
    edad                        integer,
    genero                      varchar,
    talla_camisa                varchar,
    tipo_documento              varchar,
    numero_documento            varchar,
    fecha_vencimiento_documento date,
    celular                     varchar,
    tipo_pago                   varchar,
    contacto1_nombres           varchar,
    contacto1_apellidos         varchar,
    contacto1_relacion          varchar,
    contacto1_telefono          varchar,
    contacto1_dui               varchar,
    contacto2_nombres           varchar,
    contacto2_apellidos         varchar,
    contacto2_relacion          varchar,
    contacto2_telefono          varchar,
    contacto2_dui               varchar,
    emergencia_nombres          varchar,
    emergencia_apellidos        varchar,
    emergencia_telefono         varchar,
    emergencia_relacion         varchar,
    enfermedades                text,
    tratamiento_enfermedades    text,
    alergias                    text,
    tratamiento_alergias        text,
    declarante_nombre           varchar,
    declarante_dui              varchar,
    acepta_terminos             boolean,
    firma_url                   text,
    numero_factura              varchar,
    user_ultima_actualizacion   varchar
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.created_at,
        i.primer_nombre,
        i.segundo_nombre,
        i.primer_apellido,
        i.segundo_apellido,
        i.nacionalidad,
        i.fecha_nacimiento,
        i.edad,
        i.genero,
        i.talla_camisa,
        i.tipo_documento,
        i.numero_documento,
        i.fecha_vencimiento_documento,
        i.celular,
        i.tipo_pago,
        i.contacto1_nombres,
        i.contacto1_apellidos,
        i.contacto1_relacion,
        i.contacto1_telefono,
        i.contacto1_dui,
        i.contacto2_nombres,
        i.contacto2_apellidos,
        i.contacto2_relacion,
        i.contacto2_telefono,
        i.contacto2_dui,
        i.emergencia_nombres,
        i.emergencia_apellidos,
        i.emergencia_telefono,
        i.emergencia_relacion,
        i.enfermedades,
        i.tratamiento_enfermedades,
        i.alergias,
        i.tratamiento_alergias,
        i.declarante_nombre,
        i.declarante_dui,
        i.acepta_terminos,
        i.firma_url,
        i.numero_factura,
        i.user_ultima_actualizacion
    FROM public.inscripciones i
    ORDER BY i.created_at DESC;
END;
$$;
