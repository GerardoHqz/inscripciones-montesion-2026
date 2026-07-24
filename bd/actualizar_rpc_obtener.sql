-- =========================================================================
-- ACTUALIZAR FUNCIÓN RPC: obtener_inscripciones_seguras
-- Proyecto: Inscripción Monte Sión 2026
-- INSTRUCCIÓN: Ejecutar en Supabase → SQL Editor
-- =========================================================================
-- Esta función necesita ser recreada para incluir las columnas
-- contacto1_dui y contacto2_dui en su RETURNS TABLE.
-- =========================================================================

-- Eliminar la función existente para poder cambiar su RETURNS TABLE
DROP FUNCTION IF EXISTS public.obtener_inscripciones_seguras(uuid);

CREATE OR REPLACE FUNCTION public.obtener_inscripciones_seguras(p_token uuid)
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

    -- Contacto 1
    contacto1_nombres           varchar,
    contacto1_apellidos         varchar,
    contacto1_relacion          varchar,
    contacto1_telefono          varchar,
    contacto1_dui               varchar,   -- ← NUEVA COLUMNA

    -- Contacto 2
    contacto2_nombres           varchar,
    contacto2_apellidos         varchar,
    contacto2_relacion          varchar,
    contacto2_telefono          varchar,
    contacto2_dui               varchar,   -- ← NUEVA COLUMNA

    -- Emergencia
    emergencia_nombres          varchar,
    emergencia_apellidos        varchar,
    emergencia_telefono         varchar,
    emergencia_relacion         varchar,

    -- Salud
    enfermedades                text,
    tratamiento_enfermedades    text,
    alergias                    text,
    tratamiento_alergias        text,

    -- Declarante
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
    -- Validar que el token exista y pertenezca a un admin activo
    IF NOT EXISTS (
        SELECT 1 FROM public.sesiones_admin
        WHERE token = p_token
          AND expires_at > now()
    ) THEN
        RAISE EXCEPTION 'Token inválido o expirado';
    END IF;

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
        i.contacto1_dui,        -- ← NUEVA COLUMNA

        i.contacto2_nombres,
        i.contacto2_apellidos,
        i.contacto2_relacion,
        i.contacto2_telefono,
        i.contacto2_dui,        -- ← NUEVA COLUMNA

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
