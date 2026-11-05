-- =========================================================================
-- 01. ESQUEMA COMPLETO DE BASE DE DATOS - MONTE SIÓN
-- Tablas (5), Índices, Políticas RLS y Triggers
-- Ejecutar en Supabase -> SQL Editor (Paso 1)
-- =========================================================================

-- ─── 1. EXTENSIONES ──────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── 2. TABLA: CABAÑAS (8 Columnas) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cabanas (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre            VARCHAR(100) NOT NULL UNIQUE,
    genero            VARCHAR(20) NOT NULL CHECK (genero IN ('Masculino', 'Femenino')),
    capacidad         INTEGER NOT NULL DEFAULT 12,
    cantidad_lideres  INTEGER NOT NULL DEFAULT 1,
    bus               VARCHAR(100),
    solo_boanerges    BOOLEAN NOT NULL DEFAULT false,
    created_at        TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- Índices cabañas
CREATE INDEX IF NOT EXISTS idx_cabanas_genero ON public.cabanas (genero);
CREATE INDEX IF NOT EXISTS idx_cabanas_bus ON public.cabanas (bus);

-- ─── 3. TABLA: INSCRIPCIONES (48 Columnas) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.inscripciones (
    -- Auditoría (2)
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),

    -- Datos Personales del Campamentero (14)
    primer_nombre               VARCHAR(100) NOT NULL,
    segundo_nombre              VARCHAR(100),
    primer_apellido             VARCHAR(100) NOT NULL,
    segundo_apellido            VARCHAR(100),
    nacionalidad                VARCHAR(100) NOT NULL,
    fecha_nacimiento            DATE NOT NULL,
    edad                        INTEGER NOT NULL CHECK (edad >= 10),
    genero                      VARCHAR(20) NOT NULL CHECK (genero IN ('Masculino', 'Femenino')),
    talla_camisa                VARCHAR(10),
    tipo_documento              VARCHAR(20) NOT NULL CHECK (tipo_documento IN ('DUI', 'PASAPORTE')),
    numero_documento            VARCHAR(50) NOT NULL UNIQUE,
    fecha_vencimiento_documento DATE,
    celular                     VARCHAR(30) NOT NULL,
    tipo_pago                   VARCHAR(30) CHECK (tipo_pago IN ('completo', 'medio pago', 'media beca', 'becado')),

    -- Contacto 1 Principal / Tutor (6)
    contacto1_nombres           VARCHAR(150) NOT NULL,
    contacto1_apellidos         VARCHAR(150) NOT NULL,
    contacto1_relacion          VARCHAR(100) NOT NULL,
    contacto1_telefono          VARCHAR(30) NOT NULL,
    contacto1_dui               VARCHAR(50),
    contacto1_dui_vencimiento   DATE,

    -- Contacto 2 Secundario (6)
    contacto2_nombres           VARCHAR(150),
    contacto2_apellidos         VARCHAR(150),
    contacto2_relacion          VARCHAR(100),
    contacto2_telefono          VARCHAR(30),
    contacto2_dui               VARCHAR(50),
    contacto2_dui_vencimiento   DATE,

    -- Contacto de Emergencia (4)
    emergencia_nombres          VARCHAR(150) NOT NULL,
    emergencia_apellidos        VARCHAR(150) NOT NULL,
    emergencia_relacion         VARCHAR(100) NOT NULL,
    emergencia_telefono         VARCHAR(30) NOT NULL,

    -- Información Médica (4)
    enfermedades                TEXT,
    tratamiento_enfermedades    TEXT,
    alergias                    TEXT,
    tratamiento_alergias        TEXT,

    -- Declaración y Factura (6)
    declarante_nombre           VARCHAR(250) NOT NULL,
    declarante_dui              VARCHAR(50) NOT NULL,
    acepta_terminos             BOOLEAN NOT NULL DEFAULT false CHECK (acepta_terminos = true),
    firma_url                   TEXT,
    numero_factura              VARCHAR(100),
    user_ultima_actualizacion   VARCHAR(100),

    -- Logística, Asignaciones y Flags (6)
    cabana_id                   UUID REFERENCES public.cabanas(id) ON DELETE SET NULL,
    es_empleado                 BOOLEAN DEFAULT false,
    es_lider                    BOOLEAN DEFAULT false,
    es_boanerges                BOOLEAN DEFAULT false,
    es_boanergues               BOOLEAN DEFAULT false, -- Alias de compatibilidad
    es_exclusion                BOOLEAN DEFAULT false
);

-- Índices inscripciones (Coincidentes con Dashboard de Supabase)
CREATE INDEX IF NOT EXISTS idx_inscripciones_celular ON public.inscripciones (celular);
CREATE INDEX IF NOT EXISTS idx_inscripciones_created_at ON public.inscripciones (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inscripciones_fecha_nacimiento ON public.inscripciones (fecha_nacimiento);
CREATE INDEX IF NOT EXISTS idx_inscripciones_numero_documento ON public.inscripciones (numero_documento);
CREATE INDEX IF NOT EXISTS idx_inscripciones_primer_apellido ON public.inscripciones (primer_apellido);
CREATE INDEX IF NOT EXISTS idx_inscripciones_primer_nombre ON public.inscripciones (primer_nombre);
CREATE INDEX IF NOT EXISTS idx_inscripciones_tipo_documento ON public.inscripciones (tipo_documento);
CREATE INDEX IF NOT EXISTS idx_inscripciones_cabana_id ON public.inscripciones (cabana_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_tipo_pago ON public.inscripciones (tipo_pago);
CREATE INDEX IF NOT EXISTS idx_inscripciones_genero ON public.inscripciones (genero);
CREATE INDEX IF NOT EXISTS idx_inscripciones_edad ON public.inscripciones (edad);

-- ─── 4. TABLA: USUARIOS ADMINISTRADORES (7 Columnas) ─────────────────────
CREATE TABLE IF NOT EXISTS public.usuarios_admin (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario       VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre        VARCHAR(150) NOT NULL,
    rol           VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (rol IN ('admin', 'operador', 'cajero', 'colaborador')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ─── 5. TABLA: SESIONES ADMIN (4 Columnas) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.sesiones_admin (
    token      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id   UUID NOT NULL REFERENCES public.usuarios_admin(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc', now()) + INTERVAL '7 days')
);

-- ─── 6. TABLA: CONFIGURACIÓN DINÁMICA DEL EVENTO (6 Columnas) ────────────
CREATE TABLE IF NOT EXISTS public.configuracion_evento (
    clave       TEXT PRIMARY KEY,
    valor       TEXT NOT NULL,
    descripcion TEXT,
    tipo_dato   TEXT NOT NULL DEFAULT 'string' CHECK (tipo_dato IN ('string', 'number', 'boolean', 'date')),
    categoria   TEXT NOT NULL DEFAULT 'general' CHECK (categoria IN ('general', 'cupos', 'fechas', 'validaciones')),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- ─── 7. TRIGGERS DEL SISTEMA ─────────────────────────────────────────────

-- Trigger 1: Actualizar timestamp de configuracion_evento
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_configuracion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_configuracion_evento_updated_at ON public.configuracion_evento;
CREATE TRIGGER tr_configuracion_evento_updated_at
BEFORE UPDATE ON public.configuracion_evento
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_timestamp_configuracion();

-- Trigger 2: Validar exclusividad de cabañas Boanerges
CREATE OR REPLACE FUNCTION public.validar_asignacion_cabana_boanerges()
RETURNS TRIGGER AS $$
DECLARE
    v_solo_boanerges BOOLEAN;
BEGIN
    IF NEW.cabana_id IS NOT NULL THEN
        SELECT solo_boanerges INTO v_solo_boanerges
        FROM public.cabanas
        WHERE id = NEW.cabana_id;

        IF v_solo_boanerges IS TRUE 
           AND (NEW.es_boanerges IS NOT TRUE AND NEW.es_boanergues IS NOT TRUE) 
           AND (NEW.es_lider IS NOT TRUE) THEN
            RAISE EXCEPTION 'La cabaña seleccionada es de uso exclusivo para integrantes del grupo Boanerges.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validar_cabana_boanerges ON public.inscripciones;
CREATE TRIGGER trg_validar_cabana_boanerges
BEFORE INSERT OR UPDATE OF cabana_id, es_boanerges, es_boanergues, es_lider ON public.inscripciones
FOR EACH ROW
EXECUTE FUNCTION public.validar_asignacion_cabana_boanerges();

-- ─── 8. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS) ────────────────

-- Cabañas
ALTER TABLE public.cabanas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública de cabañas" ON public.cabanas;
CREATE POLICY "Permitir lectura pública de cabañas" ON public.cabanas FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Permitir gestión de cabañas a administradores" ON public.cabanas;
CREATE POLICY "Permitir gestión de cabañas a administradores" ON public.cabanas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir gestion completa de cabanas" ON public.cabanas;
CREATE POLICY "Permitir gestion completa de cabanas" ON public.cabanas FOR ALL TO public USING (true) WITH CHECK (true);

-- Configuración del Evento
ALTER TABLE public.configuracion_evento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura pública de configuración" ON public.configuracion_evento;
CREATE POLICY "Permitir lectura pública de configuración" ON public.configuracion_evento FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Permitir gestión completa de configuración" ON public.configuracion_evento;
CREATE POLICY "Permitir gestión completa de configuración" ON public.configuracion_evento FOR ALL TO public USING (true) WITH CHECK (true);

-- Inscripciones
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir inserción pública" ON public.inscripciones;
CREATE POLICY "Permitir inserción pública" ON public.inscripciones FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "inscripciones_insert_public" ON public.inscripciones;
CREATE POLICY "inscripciones_insert_public" ON public.inscripciones FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir lectura pública temporal" ON public.inscripciones;
CREATE POLICY "Permitir lectura pública temporal" ON public.inscripciones FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Permitir lectura completa a administradores" ON public.inscripciones;
CREATE POLICY "Permitir lectura completa a administradores" ON public.inscripciones FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Permitir actualización pública temporal" ON public.inscripciones;
CREATE POLICY "Permitir actualización pública temporal" ON public.inscripciones FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualización a administradores" ON public.inscripciones;
CREATE POLICY "Permitir actualización a administradores" ON public.inscripciones FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminación a administradores" ON public.inscripciones;
CREATE POLICY "Permitir eliminación a administradores" ON public.inscripciones FOR DELETE TO authenticated USING (true);

-- Usuarios Admin (Bloquear lectura pública directa de hashes)
ALTER TABLE public.usuarios_admin ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "usuarios_admin_no_select" ON public.usuarios_admin;
CREATE POLICY "usuarios_admin_no_select" ON public.usuarios_admin FOR SELECT TO public USING (false);

-- Sesiones Admin (Bloquear lectura pública de tokens de sesión)
ALTER TABLE public.sesiones_admin ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sesiones_admin_no_select" ON public.sesiones_admin;
CREATE POLICY "sesiones_admin_no_select" ON public.sesiones_admin FOR SELECT TO public USING (false);

