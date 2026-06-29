-- ==========================================
-- SCRIPT DE BASE DE DATOS PARA SUPABASE
-- Proyecto: Inscripción Monte Sión 2026
-- ==========================================

-- Habilitar extensión para generar UUIDs si no está activa
create extension if not exists "uuid-ossp";

-- 1. CREACIÓN DE LA TABLA DE INSCRIPCIONES
create table if not exists public.inscripciones (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Pantalla 1: Datos del Campamentero
    primer_nombre varchar(100) not null,
    segundo_nombre varchar(100),
    apellidos varchar(150) not null,
    genero varchar(20) not null check (genero in ('Masculino', 'Femenino')),
    fecha_nacimiento date not null,
    edad integer not null check (edad >= 10),
    talla_camisa varchar(10),
    dui_pasaporte varchar(50) not null,
    celular varchar(30) not null,
    tipo_pago varchar(30) not null check (tipo_pago in ('completo', 'medio pago')),
    
    -- Pantalla 2: Datos de Contacto (Padre/Madre/Tutor)
    contacto1_nombres varchar(150) not null,
    contacto1_apellidos varchar(150) not null,
    contacto1_relacion varchar(100) not null,
    contacto1_telefono varchar(30) not null,
    
    contacto2_nombres varchar(150),
    contacto2_apellidos varchar(150),
    contacto2_relacion varchar(100),
    contacto2_telefono varchar(30),
    
    -- Pantalla 3: Emergencia y Médica
    emergencia_nombres varchar(150) not null,
    emergencia_apellidos varchar(150) not null,
    emergencia_telefono varchar(30) not null,
    emergencia_relacion varchar(100) not null,
    
    enfermedades text,
    tratamiento_enfermedades text,
    alergias text,
    tratamiento_alergias text,
    
    -- Pantalla 4: Declaración Jurada
    declarante_nombre varchar(250) not null,
    declarante_dui varchar(50) not null,
    acepta_terminos boolean not null default false check (acepta_terminos = true),
    
    -- Pantalla 5: Firma del Responsable
    -- Almacena la URL pública de Supabase Storage o el base64 de la imagen directamente
    firma_url text not null
);

-- Habilitar Row Level Security (RLS)
alter table public.inscripciones enable row level security;

-- 2. POLÍTICAS DE SEGURIDAD (RLS) PARA LA TABLA
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

create policy "Permitir eliminación a administradores" 
on public.inscripciones 
for delete 
to authenticated 
using (true);

-- 3. ÍNDICES PARA BÚSQUEDAS RÁPIDAS
create index if not exists idx_inscripciones_dui on public.inscripciones(dui_pasaporte);
create index if not exists idx_inscripciones_apellidos_nombres on public.inscripciones(apellidos, primer_nombre);

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

/*
-- Paso 1: Crear el Bucket público de almacenamiento llamado "firmas" si no existe
insert into storage.buckets (id, name, public)
values ('firmas', 'firmas', true)
on conflict (id) do nothing;

-- Paso 2: Permitir que usuarios no autenticados puedan subir firmas al bucket
create policy "Permitir subida pública de firmas"
on storage.objects for insert
to public
with check (bucket_id = 'firmas');

-- Paso 3: Permitir lectura pública de las firmas almacenadas
create policy "Permitir lectura pública de firmas"
on storage.objects for select
to public
using (bucket_id = 'firmas');
*/
