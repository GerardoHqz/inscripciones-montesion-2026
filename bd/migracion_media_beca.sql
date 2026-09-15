-- =========================================================================
-- MIGRACIÓN SENCILLA PARA LA BASE DE DATOS SUPABASE
-- Copia y pega solo estas 2 líneas en el SQL Editor de Supabase
-- =========================================================================

ALTER TABLE public.inscripciones DROP CONSTRAINT IF EXISTS inscripciones_tipo_pago_check;

ALTER TABLE public.inscripciones ADD CONSTRAINT inscripciones_tipo_pago_check CHECK (tipo_pago IS NULL OR tipo_pago IN ('completo', 'medio pago', 'media beca', 'becado'));
