-- =========================================================================
-- 02. FUNCIONES RPC (REMOTE PROCEDURE CALLS) - MONTE SIÓN
-- Procedimientos almacenados para autenticación, gestión y consultas seguras
-- Ejecutar en Supabase -> SQL Editor (Paso 2)
-- =========================================================================

-- ─── 1. AUTENTICACIÓN SEGURA DE ADMINISTRADORES ──────────────────────────
CREATE OR REPLACE FUNCTION public.login_admin(
    p_usuario   TEXT,
    p_password  TEXT
)
RETURNS TABLE (
    token_sesion   UUID,
    nombre_admin   VARCHAR,
    rol_usuario    VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_id UUID;
    v_nombre   VARCHAR;
    v_rol      VARCHAR;
    v_token    UUID;
BEGIN
    -- Validar usuario y hash con pgcrypto
    SELECT id, nombre, rol INTO v_admin_id, v_nombre, v_rol
    FROM public.usuarios_admin
    WHERE usuario = p_usuario
      AND password_hash = crypt(p_password, password_hash);

    IF v_admin_id IS NULL THEN
        RETURN;
    END IF;

    -- Generar token de sesión único con vigencia de 7 días
    v_token := gen_random_uuid();

    INSERT INTO public.sesiones_admin (token, admin_id, expires_at)
    VALUES (v_token, v_admin_id, timezone('utc', now()) + INTERVAL '7 days');

    RETURN QUERY
    SELECT v_token, v_nombre, v_rol;
END;
$$;

-- ─── 2. OBTENER TODAS LAS INSCRIPCIONES (CON VALIDACIÓN DE TOKEN) ────────
DROP FUNCTION IF EXISTS public.obtener_inscripciones_seguras(TEXT);
DROP FUNCTION IF EXISTS public.obtener_inscripciones_seguras(UUID);

CREATE OR REPLACE FUNCTION public.obtener_inscripciones_seguras(p_token TEXT)
RETURNS TABLE (
    id                          UUID,
    created_at                  TIMESTAMPTZ,
    primer_nombre               VARCHAR,
    segundo_nombre              VARCHAR,
    primer_apellido             VARCHAR,
    segundo_apellido            VARCHAR,
    nacionalidad                VARCHAR,
    fecha_nacimiento            DATE,
    edad                        INTEGER,
    genero                      VARCHAR,
    talla_camisa                VARCHAR,
    tipo_documento              VARCHAR,
    numero_documento            VARCHAR,
    fecha_vencimiento_documento DATE,
    celular                     VARCHAR,
    tipo_pago                   VARCHAR,
    contacto1_nombres           VARCHAR,
    contacto1_apellidos         VARCHAR,
    contacto1_relacion          VARCHAR,
    contacto1_telefono          VARCHAR,
    contacto1_dui               VARCHAR,
    contacto1_dui_vencimiento   DATE,
    contacto2_nombres           VARCHAR,
    contacto2_apellidos         VARCHAR,
    contacto2_relacion          VARCHAR,
    contacto2_telefono          VARCHAR,
    contacto2_dui               VARCHAR,
    contacto2_dui_vencimiento   DATE,
    emergencia_nombres          VARCHAR,
    emergencia_apellidos        VARCHAR,
    emergencia_telefono         VARCHAR,
    emergencia_relacion         VARCHAR,
    enfermedades                TEXT,
    tratamiento_enfermedades    TEXT,
    alergias                    TEXT,
    tratamiento_alergias        TEXT,
    declarante_nombre           VARCHAR,
    declarante_dui              VARCHAR,
    acepta_terminos             BOOLEAN,
    firma_url                   TEXT,
    numero_factura              VARCHAR,
    user_ultima_actualizacion   VARCHAR,
    cabana_id                   UUID,
    es_empleado                 BOOLEAN,
    es_lider                    BOOLEAN,
    es_boanerges                BOOLEAN,
    es_exclusion                BOOLEAN
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
        i.contacto1_dui_vencimiento,
        i.contacto2_nombres,
        i.contacto2_apellidos,
        i.contacto2_relacion,
        i.contacto2_telefono,
        i.contacto2_dui,
        i.contacto2_dui_vencimiento,
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
        i.user_ultima_actualizacion,
        i.cabana_id,
        i.es_empleado,
        i.es_lider,
        i.es_boanerges,
        i.es_exclusion
    FROM public.inscripciones i
    ORDER BY i.created_at DESC;
END;
$$;

-- ─── 3. GUARDAR EDICIÓN DE FICHA DE CAMPAMENTERO ─────────────────────────
DROP FUNCTION IF EXISTS public.guardar_edicion_segura(TEXT, UUID, JSONB);

CREATE OR REPLACE FUNCTION public.guardar_edicion_segura(
    p_token TEXT,
    p_id    UUID,
    p_datos JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.inscripciones
    SET
        primer_nombre               = COALESCE(p_datos->>'primer_nombre', primer_nombre),
        segundo_nombre              = NULLIF(p_datos->>'segundo_nombre', ''),
        primer_apellido             = COALESCE(p_datos->>'primer_apellido', primer_apellido),
        segundo_apellido            = NULLIF(p_datos->>'segundo_apellido', ''),
        nacionalidad                = COALESCE(p_datos->>'nacionalidad', nacionalidad),
        genero                      = COALESCE(p_datos->>'genero', genero),
        fecha_nacimiento            = COALESCE((p_datos->>'fecha_nacimiento')::date, fecha_nacimiento),
        edad                        = COALESCE((p_datos->>'edad')::integer, edad),
        talla_camisa                = NULLIF(p_datos->>'talla_camisa', ''),
        tipo_documento              = COALESCE(p_datos->>'tipo_documento', tipo_documento),
        numero_documento            = COALESCE(p_datos->>'numero_documento', numero_documento),
        fecha_vencimiento_documento = NULLIF(p_datos->>'fecha_vencimiento_documento', '')::date,
        celular                     = COALESCE(p_datos->>'celular', celular),
        tipo_pago                   = NULLIF(p_datos->>'tipo_pago', ''),

        -- Contactos
        contacto1_nombres           = COALESCE(p_datos->>'contacto1_nombres', contacto1_nombres),
        contacto1_apellidos         = COALESCE(p_datos->>'contacto1_apellidos', contacto1_apellidos),
        contacto1_relacion          = COALESCE(p_datos->>'contacto1_relacion', contacto1_relacion),
        contacto1_telefono          = COALESCE(p_datos->>'contacto1_telefono', contacto1_telefono),
        contacto1_dui               = NULLIF(p_datos->>'contacto1_dui', ''),
        contacto1_dui_vencimiento   = NULLIF(p_datos->>'contacto1_dui_vencimiento', '')::date,

        contacto2_nombres           = NULLIF(p_datos->>'contacto2_nombres', ''),
        contacto2_apellidos         = NULLIF(p_datos->>'contacto2_apellidos', ''),
        contacto2_relacion          = NULLIF(p_datos->>'contacto2_relacion', ''),
        contacto2_telefono          = NULLIF(p_datos->>'contacto2_telefono', ''),
        contacto2_dui               = NULLIF(p_datos->>'contacto2_dui', ''),
        contacto2_dui_vencimiento   = NULLIF(p_datos->>'contacto2_dui_vencimiento', '')::date,

        -- Emergencia
        emergencia_nombres          = COALESCE(p_datos->>'emergencia_nombres', emergencia_nombres),
        emergencia_apellidos        = COALESCE(p_datos->>'emergencia_apellidos', emergencia_apellidos),
        emergencia_telefono         = COALESCE(p_datos->>'emergencia_telefono', emergencia_telefono),
        emergencia_relacion         = COALESCE(p_datos->>'emergencia_relacion', emergencia_relacion),

        -- Salud
        enfermedades                = NULLIF(p_datos->>'enfermedades', ''),
        tratamiento_enfermedades    = NULLIF(p_datos->>'tratamiento_enfermedades', ''),
        alergias                    = NULLIF(p_datos->>'alergias', ''),
        tratamiento_alergias        = NULLIF(p_datos->>'tratamiento_alergias', ''),

        -- Declaración y Facturación
        declarante_nombre           = COALESCE(p_datos->>'declarante_nombre', declarante_nombre),
        declarante_dui              = COALESCE(p_datos->>'declarante_dui', declarante_dui),
        numero_factura              = NULLIF(p_datos->>'numero_factura', ''),
        user_ultima_actualizacion   = NULLIF(p_datos->>'user_ultima_actualizacion', ''),

        -- Asignaciones
        es_empleado                 = COALESCE((p_datos->>'es_empleado')::boolean, es_empleado),
        es_lider                    = COALESCE((p_datos->>'es_lider')::boolean, es_lider),
        es_boanerges                = COALESCE((p_datos->>'es_boanerges')::boolean, es_boanerges),
        es_exclusion                = COALESCE((p_datos->>'es_exclusion')::boolean, es_exclusion)
    WHERE id = p_id;
END;
$$;

-- ─── 4. OBTENER CONFIGURACIÓN COMPLETA DEL EVENTO ────────────────────────
CREATE OR REPLACE FUNCTION public.obtener_configuracion_evento()
RETURNS TABLE (
    clave       TEXT,
    valor       TEXT,
    descripcion TEXT,
    tipo_dato   TEXT,
    categoria   TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT clave, valor, descripcion, tipo_dato, categoria
    FROM public.configuracion_evento
    ORDER BY categoria, clave;
$$;

-- ─── 5. ACTUALIZAR PARÁMETRO DINÁMICO DEL EVENTO ─────────────────────────
CREATE OR REPLACE FUNCTION public.actualizar_parametro_evento(
    p_clave TEXT,
    p_valor TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.configuracion_evento
    SET valor = p_valor
    WHERE clave = p_clave;

    RETURN FOUND;
END;
$$;

-- ─── 6. CONTEO DE CUPOS DE MENORES DE EDAD ───────────────────────────────
CREATE OR REPLACE FUNCTION public.obtener_cupos_menores()
RETURNS TABLE (
    total_menores     BIGINT,
    cupo_maximo       BIGINT,
    cupos_disponibles BIGINT,
    agotado           BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_menores BIGINT;
    v_cupo_maximo   BIGINT;
BEGIN
    -- Obtener cupo configurado
    SELECT COALESCE(valor::bigint, 205) INTO v_cupo_maximo
    FROM public.configuracion_evento
    WHERE clave = 'cupo_maximo_menores';

    IF v_cupo_maximo IS NULL THEN
        v_cupo_maximo := 205;
    END IF;

    -- Conteo exacto de menores (< 18 años)
    SELECT count(*) INTO v_total_menores
    FROM public.inscripciones
    WHERE edad < 18;

    RETURN QUERY
    SELECT
        v_total_menores,
        v_cupo_maximo,
        GREATEST(0::bigint, v_cupo_maximo - v_total_menores),
        (v_total_menores >= v_cupo_maximo);
END;
$$;

-- ─── 7. CONFIRMAR PAGO SEGURO ────────────────────────────────────────────
DROP FUNCTION IF EXISTS public.confirmar_pago_seguro(TEXT, UUID, TEXT, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.confirmar_pago_seguro(TEXT, UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.confirmar_pago_seguro(
    p_token          TEXT,
    p_id             UUID,
    p_tipo_pago      TEXT,
    p_numero_factura TEXT DEFAULT NULL,
    p_es_empleado    BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.inscripciones
    SET
        tipo_pago      = p_tipo_pago,
        numero_factura = NULLIF(p_numero_factura, ''),
        es_empleado    = COALESCE(p_es_empleado, false)
    WHERE id = p_id;
END;
$$;

-- ─── 8. VERIFICAR ADMIN (MÉTODO DE VALIDACIÓN DIRECTO/LEGACY) ────────────
CREATE OR REPLACE FUNCTION public.verificar_admin(
    p_usuario  TEXT,
    p_password TEXT
)
RETURNS TABLE (
    id      UUID,
    usuario VARCHAR,
    nombre  VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.usuario, u.nombre
    FROM public.usuarios_admin u
    WHERE u.usuario = p_usuario
      AND u.password_hash = crypt(p_password, u.password_hash);
END;
$$;


