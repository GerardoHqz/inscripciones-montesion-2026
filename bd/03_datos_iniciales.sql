-- =========================================================================
-- 03. DATOS INICIALES Y SEMILLAS - MONTE SIÓN
-- Usuario admin inicial, catálogo de 32 cabañas y parámetros por defecto
-- Ejecutar en Supabase -> SQL Editor (Paso 3)
-- =========================================================================

-- ─── 1. USUARIO ADMINISTRADOR INICIAL ────────────────────────────────────
-- Usuario: admin
-- Contraseña temporal: admin123
INSERT INTO public.usuarios_admin (usuario, password_hash, nombre, rol)
VALUES (
    'admin',
    crypt('admin123', gen_salt('bf', 8)),
    'Organizador Monte Sión',
    'admin'
)
ON CONFLICT (usuario) DO NOTHING;

-- ─── 2. PARÁMETROS DINÁMICOS DE CONFIGURACIÓN ────────────────────────────
INSERT INTO public.configuracion_evento (clave, valor, descripcion, tipo_dato, categoria)
VALUES
    ('cupo_maximo_menores', '205', 'Límite máximo de cupos permitidos para menores de 18 años.', 'number', 'cupos'),
    ('edad_minima_inscripcion', '10', 'Edad mínima en años para poder inscribirse al campamento.', 'number', 'validaciones'),
    ('edad_mayoria_edad', '18', 'Umbral de edad para considerarse mayor de edad en formularios y asignaciones.', 'number', 'validaciones'),
    ('nombre_campamento', 'Monte Sión 2026', 'Nombre oficial de la edición actual del evento.', 'string', 'general'),
    ('fechas_evento_texto', '23 al 28 de noviembre', 'Texto descriptivo visible de las fechas del evento.', 'string', 'fechas'),
    ('fecha_inicio_campamento', '2026-11-23', 'Fecha ISO de inicio del campamento (YYYY-MM-DD).', 'date', 'fechas'),
    ('fecha_fin_campamento', '2026-11-28', 'Fecha ISO de finalización del campamento (YYYY-MM-DD).', 'date', 'fechas'),
    ('fecha_minima_vencimiento_documento', '2027-05-28', 'Fecha mínima que debe tener el DUI o pasaporte para considerarse vigente (6 meses post evento).', 'date', 'validaciones'),
    ('meses_vigencia_minima_documento', '6', 'Meses de vigencia mínima requeridos post-campamento para regulaciones de viaje.', 'number', 'validaciones'),
    ('lugar_pago', 'Taber Store', 'Lugar físico o entidad donde los participantes completan su pago.', 'string', 'general'),
    ('inscripciones_activas', 'true', 'Switch maestro: true habilita el formulario público; false muestra aviso de inscripciones cerradas.', 'boolean', 'general')
ON CONFLICT (clave) DO NOTHING;

-- ─── 3. CATÁLOGO OFICIAL DE 32 CABAÑAS (16 MASCULINAS Y 16 FEMENINAS) ────
INSERT INTO public.cabanas (nombre, capacidad, cantidad_lideres, genero, bus, solo_boanerges)
VALUES
    -- ============================
    -- CABAÑAS MASCULINAS (16)
    -- ============================
    ('Koinonia 1',   12, 1, 'Masculino', 'Bus #6', false),
    ('Koinonia 2',   10, 1, 'Masculino', 'Bus #7', false),
    ('Koinonia 3',   16, 2, 'Masculino', 'Bus #2', false),
    ('Koinonia 4',   16, 2, 'Masculino', 'Bus #1', false),
    ('Filadelfia',  15, 1, 'Masculino', 'Bus #4', false),
    ('Moriah',      12, 1, 'Masculino', 'Bus #8', false),
    ('Horeb',       14, 2, 'Masculino', 'Bus #2', false),
    ('Oasis',       15, 2, 'Masculino', 'Bus #3', false),
    ('Ebal',        13, 1, 'Masculino', 'Bus #4', false),
    ('Armenia',     13, 1, 'Masculino', 'Bus #6', false),
    ('Omega',       13, 1, 'Masculino', 'Bus #8', false),
    ('Anakainos 1', 12, 1, 'Masculino', 'Bus #9', false),
    ('Anakainos 2', 12, 2, 'Masculino', 'Bus #7', false),
    ('Peniel',      13, 1, 'Masculino', 'Bus #5', false),
    ('Alfa',        13, 1, 'Masculino', 'Bus #5', false),
    ('Elim',        12, 2, 'Masculino', NULL,     false),

    -- ============================
    -- CABAÑAS FEMENINAS (16)
    -- ============================
    ('Agape 1',     15, 2, 'Femenino',  'Bus #3', false),
    ('Agape 2',     17, 1, 'Femenino',  'Bus #1', false),
    ('Agape 3',     17, 2, 'Femenino',  'Bus #2', false),
    ('Agape 4',     16, 1, 'Femenino',  'Bus #3', false),
    ('Moab',        14, 1, 'Femenino',  'Bus #1', false),
    ('Huéspedes 1', 10, 1, 'Femenino',  'Bus #8', false),
    ('Huéspedes 2', 10, 2, 'Femenino',  'Bus #6', false),
    ('Huéspedes 3', 12, 1, 'Femenino',  'Bus #9', false),
    ('Belén',       13, 1, 'Femenino',  'Bus #7', false),
    ('Efeso',       15, 1, 'Femenino',  'Bus #4', false),
    ('Juda',        13, 1, 'Femenino',  'Bus #5', false),
    ('Shekinah 1',   8, 1, 'Femenino',  'Bus #5', false),
    ('Shekinah 2',  12, 1, 'Femenino',  'Bus #6', false),
    ('Sinaí',       12, 1, 'Femenino',  'Bus #8', false),
    ('Gerizim',     12, 1, 'Femenino',  'Bus #7', false),
    ('Esmirna',     14, 1, 'Femenino',  'Bus #9', false)

ON CONFLICT (nombre) DO UPDATE
SET
    capacidad = EXCLUDED.capacidad,
    cantidad_lideres = EXCLUDED.cantidad_lideres,
    genero = EXCLUDED.genero,
    bus = EXCLUDED.bus;

