# Administrar Bosich Legal

## Accesos

- `/admin`: resumen de las secciones.
- `/admin/paginas`: textos, imagenes y SEO de inicio, servicios, sobre nosotros, ubicacion, contacto, noticias y propiedades.
- `/admin/servicios`: tarjetas, orden, materias, visibilidad en inicio y enlaces.
- `/admin/servicios/paginas`: crear y editar las paginas individuales de las especialidades, con papelera y vista previa privada.
- `/admin/crear-blog`: noticias y papelera.
- `/admin/propiedades`: catalogo y papelera.
- `/admin/miembros`: equipo, orden, fotografias y papelera.
- `/admin/solicitudes-contacto`: seguimiento y papelera de solicitudes.
- `/admin/contenido`: datos comunes de contacto, redes, menu, pie de pagina e integraciones.

## Paginas principales

En cada pagina, Contenido permite modificar sus textos e imagenes sin cambiar el diseno. SEO y redes permite editar titulo, descripcion, URL canonica, presentacion al compartir e indexacion. El boton automatico completa solo campos vacios, sin sobrescribir el trabajo manual.

Las oficinas se editan en Ubicacion y se reflejan tambien en el pie de pagina. La informacion compartida de telefono, correo, redes y horarios permanece en Ajustes. Los controles anteriores de inicio y SEO general siguen siendo compatibles con los nuevos editores.

## Paginas individuales de servicios

Se pueden guardar borradores, publicar, previsualizar, editar titulos y textos con formato, agregar imagenes, ordenar secciones, etapas, preguntas frecuentes, fuentes y enlaces relacionados. El H1 corresponde al titulo principal; los editores internos ofrecen H2 y H3 para mantener una estructura coherente.

La URL queda fija despues de crear la pagina para evitar romper enlaces existentes. Para enlazarla desde una tarjeta debe estar publicada. Antes de retirar una pagina vinculada, se deben quitar sus enlaces en tarjetas y paginas relacionadas; el panel informa cuales la utilizan.

## Papeleras

Enviar a papelera retira el contenido del sitio publico, conservando sus campos. Restaurar noticias, paginas y propiedades las devuelve como borrador. Los miembros se restauran como no visibles; las solicitudes conservan su estado de seguimiento.

Eliminar definitivamente solo esta disponible para registros que ya estan en papelera y requiere confirmacion. No se borran automaticamente archivos de imagen, porque pueden estar compartidos con otros contenidos. No existe vaciado automatico ni una caducidad programada de las papeleras.

## SEO y seguridad

Desactivar la indexacion aplica noindex y excluye la pagina del sitemap; no la hace privada ni garantiza una retirada inmediata de Google. Los borradores y las papeleras no son publicos. El administrador y sus vistas previas requieren sesion y no se indexan.

Las claves privadas siguen fuera del editor. Las operaciones se autorizan en el servidor. La migracion `20261030021333_admin_recycle_bins_and_property_indexing.sql` agrega las columnas de papelera y restringe la lectura publica de servicios eliminados.

## Verificacion de esta entrega

- Compilacion de produccion y 37 pruebas automatizadas correctas.
- Guardado real del inicio y de Derechos Humanos comprobado, conservando la redaccion actual.
- URL de servicio repetida rechazada conservando los campos.
- Once paginas publicas revisadas en movil: un H1, canonicas individuales y sin imagenes rotas.
- Secciones del administrador conectadas a Supabase y comprobadas sin errores de carga.
- Consulta transaccional con rollback confirma que la papelera de servicios no es publica y que visitantes no pueden insertar, actualizar ni eliminar.
- Rutas privadas redirigen al acceso y las subidas sin sesion responden 401.

No se eliminaron definitivamente contenidos del cliente para probar las papeleras. Las pruebas automatizadas de eliminacion definitiva usan datos simulados y la prueba de permisos en Supabase se revirtio con rollback.
