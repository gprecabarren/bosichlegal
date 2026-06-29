# Supabase para Bosich Legal

Este proyecto debe usar un proyecto Supabase separado, por ejemplo `bosichlegal`.
No reutilizar bases, buckets ni variables de otros proyectos.

## 1. Crear proyecto

1. Entrar a https://supabase.com/dashboard.
2. Crear un proyecto nuevo llamado `bosichlegal`.
3. Guardar la región y contraseña de base de datos en un lugar seguro.

## 2. Ejecutar SQL

1. Abrir el proyecto `bosichlegal`.
2. Ir a `SQL Editor`.
3. Copiar todo el contenido de `supabase.sql`.
4. Ejecutarlo.

Esto crea:

- Tabla `site_content`.
- Tabla `team_members`.
- Bucket público `team-member-photos`.
- RLS activado en tablas.
- Datos iniciales de integrantes con fotos locales.

## 3. Variables para Vercel

En Vercel, proyecto `bosichlegal`, agregar estas variables en Production, Preview y Development:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
SUPABASE_CONTENT_TABLE=site_content
SUPABASE_MEMBERS_TABLE=team_members
SUPABASE_MEMBERS_BUCKET=team-member-photos
```

La `SUPABASE_SERVICE_ROLE_KEY` debe quedar solo en Vercel y nunca en GitHub.

## 4. Verificar

1. Redesplegar en Vercel.
2. Entrar a `/admin`.
3. Iniciar sesión.
4. Crear, editar, ordenar, activar/desactivar o borrar integrantes.
5. Probar carga de foto.

