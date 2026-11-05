# Scripts de Base de Datos - Inscripción Campamento Monte Sión

Este directorio contiene los scripts SQL ordenados y consolidados necesarios para inicializar, configurar o replicar la base de datos completa del sistema en cualquier instancia de **Supabase** (o PostgreSQL).

---

## 🚀 Guía de Despliegue en una Nueva Instancia de Supabase

Para recrear el backend desde cero, sigue estos 3 pasos en orden en el **SQL Editor** de tu panel de Supabase:

### Paso 1: Crear Estructura, Tablas, Índices, Triggers y Seguridad
- **Archivo:** [`01_esquema_completo.sql`](file:///c:/Users/gerar/OneDrive/Imágenes/WORKSPACE/inscripcion-montesion-2026/bd/01_esquema_completo.sql)
- **Qué hace:**
  - Habilita las extensiones `uuid-ossp` y `pgcrypto`.
  - Crea las 5 tablas maestras: `cabanas` (8 col), `inscripciones` (48 col), `usuarios_admin` (7 col), `sesiones_admin` (4 col) y `configuracion_evento` (6 col).
  - Configura los índices en todas las columnas críticas de búsqueda y relaciones.
  - Implementa los triggers automáticos: `tr_configuracion_evento_updated_at` (actualización de timestamps) y `trg_validar_cabana_boanerges` (validación de exclusividad de cabañas Boanerges).
  - Habilita Row Level Security (RLS) y aplica las políticas de acceso públicas y protegidas.

### Paso 2: Crear Funciones RPC (Procedimientos Almacenados)
- **Archivo:** [`02_funciones_rpc.sql`](file:///c:/Users/gerar/OneDrive/Imágenes/WORKSPACE/inscripcion-montesion-2026/bd/02_funciones_rpc.sql)
- **Qué hace:**
  - `login_admin`: Validación segura de credenciales con token de sesión de 7 días.
  - `obtener_inscripciones_seguras`: Consulta protegida del panel administrativo.
  - `guardar_edicion_segura`: Actualización integral de la ficha de un campamentero.
  - `confirmar_pago_seguro`: Registro y actualización segura de tipo de pago, número de factura y flags de empleado.
  - `obtener_configuracion_evento`: Obtención de parámetros dinámicos del evento.
  - `actualizar_parametro_evento`: Modificación en caliente de cupos, fechas o toggles.
  - `obtener_cupos_menores`: Conteo y control automático de cupo para menores de 18 años.
  - `verificar_admin`: Validación directa de credenciales para compatibilidad con módulos administrativos.

### Paso 3: Cargar Datos Iniciales y Semillas
- **Archivo:** [`03_datos_iniciales.sql`](file:///c:/Users/gerar/OneDrive/Imágenes/WORKSPACE/inscripcion-montesion-2026/bd/03_datos_iniciales.sql)
- **Qué hace:**
  - Inserta el usuario administrador inicial:
    - **Usuario:** `admin`
    - **Contraseña:** `admin123`
  - Inserta los parámetros por defecto del evento (cupo de 205 menores, vigencia mínima, lugar de pago, fechas).
  - Inserta el catálogo oficial de las 32 cabañas (16 masculinas y 16 femeninas) con sus respectivas capacidades, líderes asignados y rutas de buses.

---

## 🔒 Credenciales por Defecto
Al completar la instalación, puedes ingresar al panel administrativo con:
- **URL:** `/login`
- **Usuario:** `admin`
- **Contraseña:** `admin123` *(Se recomienda cambiarla tras el primer ingreso)*

