-- ==========================================
-- SCRIPT DE BASE DE DATOS PARA SUPABASE
-- Proyecto: Inscripción Monte Sión 2026
-- ==========================================

-- Habilitar extensión para generar UUIDs si no está activa
create extension if not exists "uuid-ossp";

-- 1. CREACIÓN DE LA TABLA DE INSCRIPCIONES
-- 1. CREACIÓN DE LA TABLA DE INSCRIPCIONES (RECREACIÓN LIMPIA)
drop table if exists public.inscripciones cascade;

create table public.inscripciones (

    -- ============================
    -- Auditoría
    -- ============================
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default timezone('utc', now()),

    -- ============================
    -- Datos personales del campamentero
    -- ============================
    primer_nombre varchar(100) not null,
    segundo_nombre varchar(100),

    primer_apellido varchar(100) not null,
    segundo_apellido varchar(100),

    nacionalidad varchar(100) not null,

    fecha_nacimiento date not null,

    edad integer not null
        check (edad >= 10),

    genero varchar(20) not null
        check (genero in ('Masculino','Femenino')),

    talla_camisa varchar(10),

    tipo_documento varchar(20) not null
        check (tipo_documento in ('DUI','PASAPORTE')),

    numero_documento varchar(50) not null,

    fecha_vencimiento_documento date,

    celular varchar(30) not null,

    tipo_pago varchar(30)
        check (tipo_pago in ('completo','medio pago','becado')),

    -- ============================
    -- Contacto principal
    -- ============================
    contacto1_nombres varchar(150) not null,
    contacto1_apellidos varchar(150) not null,
    contacto1_relacion varchar(100) not null,
    contacto1_telefono varchar(30) not null,
    contacto1_dui varchar(50),

    -- ============================
    -- Contacto secundario
    -- ============================
    contacto2_nombres varchar(150),
    contacto2_apellidos varchar(150),
    contacto2_relacion varchar(100),
    contacto2_telefono varchar(30),
    contacto2_dui varchar(50),

    -- ============================
    -- Contacto de emergencia
    -- ============================
    emergencia_nombres varchar(150) not null,
    emergencia_apellidos varchar(150) not null,
    emergencia_relacion varchar(100) not null,
    emergencia_telefono varchar(30) not null,

    -- ============================
    -- Información médica
    -- ============================
    enfermedades text,
    tratamiento_enfermedades text,

    alergias text,
    tratamiento_alergias text,

    -- ============================
    -- Declaración
    -- ============================
    declarante_nombre varchar(250) not null,
    declarante_dui varchar(50) not null,

    acepta_terminos boolean not null
        default false
        check (acepta_terminos = true),

    -- URL pública de Supabase Storage
    firma_url text not null,

    -- Facturación en librería
    numero_factura varchar(100)
);

-- ============================
-- 2. ÍNDICES DE LA TABLA
-- ============================

-- Documento
create unique index idx_inscripciones_numero_documento
on public.inscripciones (numero_documento);

-- Fecha de creación
create index idx_inscripciones_created_at
on public.inscripciones (created_at desc);

-- Apellidos
create index idx_inscripciones_primer_apellido
on public.inscripciones (primer_apellido);

-- Nombre
create index idx_inscripciones_primer_nombre
on public.inscripciones (primer_nombre);

-- Celular
create index idx_inscripciones_celular
on public.inscripciones (celular);

-- Tipo de documento
create index idx_inscripciones_tipo_documento
on public.inscripciones (tipo_documento);

-- Fecha de nacimiento
create index idx_inscripciones_fecha_nacimiento
on public.inscripciones (fecha_nacimiento);


-- ==========================================
-- 3. POLÍTICAS DE SEGURIDAD (RLS) PARA LA TABLA
-- ==========================================

-- Habilitar Row Level Security (RLS)
alter table public.inscripciones enable row level security;

-- Permitir que cualquier persona inserte una nueva inscripción desde el formulario web (público)
create policy "Permitir inserción pública" 
on public.inscripciones 
for insert 
with check (true);

-- Permitir lectura completa a administradores autenticados
create policy "Permitir lectura completa a administradores" 
on public.inscripciones 
for select 
to authenticated 
using (true);

-- Permitir lectura pública temporal para el dashboard sin login (puedes borrarla cuando agregues seguridad)
create policy "Permitir lectura pública temporal"
on public.inscripciones
for select
using (true);

create policy "Permitir actualización a administradores" 
on public.inscripciones 
for update 
to authenticated 
using (true);

-- Permitir actualización pública temporal para el dashboard sin login
-- (igual que la lectura pública — eliminar cuando agregues autenticación)
create policy "Permitir actualización pública temporal"
on public.inscripciones
for update
using (true)
with check (true);

create policy "Permitir eliminación a administradores" 
on public.inscripciones 
for delete 
to authenticated 
using (true);

-- =========================================================================
-- MANEJO DE LA FIRMA (Dos alternativas recomendadas)
-- =========================================================================
--
-- OPCIÓN A: Base64 directo en la base de datos (Columna `firma_url` almacena el base64)
-- -------------------------------------------------------------------------
-- * Pros: No requiere configuración adicional en Supabase Storage. Guardas el string base64
--   (ej. 'data:image/png;base64,...') generado por el canvas directamente en el campo `firma_url`.
-- * Contras: Las filas de la base de datos serán ligeramente más grandes (~10KB a 40KB por registro),
--   pero para el volumen de un formulario de inscripción de campamento no afectará en absoluto el rendimiento.
--
-- OPCIÓN B: Supabase Storage Bucket (Recomendado para almacenamiento limpio de archivos)
-- -------------------------------------------------------------------------
-- * Guardas la firma como un archivo físico en un "Bucket" y la URL pública de ese archivo en `firma_url`.
-- * Si prefieres usar esta opción, ejecuta las siguientes sentencias SQL en el editor de Supabase:
--
-- Paso 1: Crear el Bucket público de almacenamiento llamado "firmas" si no existe
-- insert into storage.buckets (id, name, public)
-- values ('firmas', 'firmas', true)
-- on conflict (id) do nothing;
--
-- Paso 2: Permitir que usuarios no autenticados puedan subir firmas al bucket
-- create policy "Permitir subida pública de firmas"
-- on storage.objects for insert
-- to public
-- with check (bucket_id = 'firmas');
--
-- Paso 3: Permitir lectura pública de las firmas almacenadas
-- create policy "Permitir lectura pública de firmas"
-- on storage.objects for select
-- to public
-- using (bucket_id = 'firmas');


-- =========================================================================
-- 3. AUTENTICACIÓN DE ADMINISTRADORES
-- =========================================================================

-- Habilitar extensión criptográfica para encriptar contraseñas
create extension if not exists pgcrypto;

-- Crear tabla de administradores
create table public.usuarios_admin (
    id uuid primary key default gen_random_uuid(),
    usuario varchar(100) not null unique,
    password_hash varchar(255) not null,
    nombre varchar(150) not null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

-- Habilitar RLS para que nadie pueda listar los hashes externamente
alter table public.usuarios_admin enable row level security;

create policy "usuarios_admin_no_select"
on public.usuarios_admin
for select
using (false);

-- Función segura (RPC) para validar credenciales
create or replace function public.verificar_admin(p_usuario text, p_password text)
returns table (id uuid, usuario varchar, nombre varchar)
language plpgsql
security definer
as $$
begin
    return query
    select u.id, u.usuario, u.nombre
    from public.usuarios_admin u
    where u.usuario = p_usuario
      and u.password_hash = crypt(p_password, u.password_hash);
end;
$$;

-- Insertar usuario administrador inicial (Usuario: admin, Contraseña: admin123)
insert into public.usuarios_admin (usuario, password_hash, nombre)
values ('admin', crypt('admin123', gen_salt('bf', 8)), 'Organizador Monte Sión')
on conflict (usuario) do nothing;


