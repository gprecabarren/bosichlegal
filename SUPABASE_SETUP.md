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
- Tabla `contact_submissions`.
- Tabla `news_posts`.
- Bucket público `team-member-photos`.
- Bucket público `news-images`.
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
SUPABASE_CONTACT_SUBMISSIONS_TABLE=contact_submissions
SUPABASE_NEWS_POSTS_TABLE=news_posts
SUPABASE_NEWS_IMAGES_BUCKET=news-images
```

La `SUPABASE_SERVICE_ROLE_KEY` debe quedar solo en Vercel y nunca en GitHub.

## 4. Formulario de contacto

El formulario guarda casos en `contact_submissions` y los muestra en `/admin`.
Para recibir avisos por correo, configurar un proveedor transaccional como Resend:

```env
RESEND_API_KEY=
CONTACT_NOTIFY_EMAIL=nicolas@bosichlegal.cl
CONTACT_FROM_EMAIL=Bosich Legal <contacto@bosichlegal.cl>
```

Para captcha real con Cloudflare Turnstile:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
CONTACT_IP_SALT=generate-a-long-random-secret
```

Sin Turnstile configurado, el formulario mantiene honeypot, tiempo mínimo y rate limit por IP/email.

## 5. Google Search Console

En `/admin`, pestaña `Contenido del sitio`, sección `SEO`, pegar solo el valor del atributo `content` del meta tag:

```html
<meta name="google-site-verification" content="ESTE_VALOR" />
```

El sitio lo publicará automáticamente como meta tag global. También existe `sitemap.xml` en:

```text
https://bosichlegal.cl/sitemap.xml
```

## 6. Correos corporativos y alertas

En `/admin`, sección `Configuración técnica`, dejar configurado:

- Correo que recibe solicitudes de contacto.
- Remitente de notificaciones.
- Notas DNS/correos corporativos.

Para que los correos salgan realmente, Vercel debe tener `RESEND_API_KEY` y el dominio debe estar verificado en Resend con sus registros DNS.

## 7. Noticias

La sección `/noticias` muestra solo publicaciones con estado `Publicado`.
Desde `/admin`, el administrador puede:

- Crear noticias como borrador o publicadas.
- Editar título, slug, bajada, imagen destacada y contenido.
- Usar formato básico: H1, H2, H3, negrita, cursiva, subrayado, listas, citas, enlaces e imágenes por URL.
- Eliminar publicaciones.

El contenido HTML se sanea en servidor antes de guardarse.

## 8. Verificar

1. Redesplegar en Vercel.
2. Entrar a `/admin`.
3. Iniciar sesión.
4. Crear, editar, ordenar, activar/desactivar o borrar integrantes.
5. Probar carga de foto.
6. Enviar un caso desde `/contacto` y revisarlo en `/admin`.
7. Crear una noticia, publicarla y revisarla en `/noticias`.

## 9. Propiedades y servicios

Las migraciones `20261021165313_add_property_listings.sql` y
`20261021165816_restore_official_service_copy.sql` incorporan el catálogo y los
textos del diseño original. Se aplicaron al proyecto Bosich Legal de Nicolás.

- `/admin/propiedades`: catálogo privado, alta, edición y papelera recuperable.
- `/admin/propiedades/nueva`: título, enlace, descripción, ciudad, región, precio
  en CLP/UF, características, galería ordenable y SEO manual o automático.
- `/admin/propiedades/[id]/vista-previa`: muestra el diseño de la publicación
  sin hacer público un borrador. Requiere la sesión del administrador.
- `/admin/servicios`: títulos de página/inicio, descripción, materias e ícono
  oficial de cada servicio. Los datos se guardan en `site_content`.
- `/propiedades/[slug]`: página pública de cada publicación.
- `/propiedades/ubicacion/[region]/[ciudad]`: páginas por ubicación, creadas al
  publicar propiedades en esa localidad e incluidas automáticamente en sitemap.

La tabla `properties` tiene RLS: visitantes solo leen publicaciones públicas
vigentes. El servidor exige la sesión del administrador para guardar, subir
imágenes, enviar a papelera o restaurar. No se conceden escrituras públicas.
El bucket `property-images` admite JPG, PNG y WebP de hasta 4 MB por archivo.
Las imágenes se guardan sin recomprimir. La primera fotografía es la portada.
Los borradores y elementos de papelera no aparecen en el catálogo ni sitemap.
