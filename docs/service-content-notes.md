# Servicios: criterios editoriales y mantenimiento

Revisión inicial: 29 de octubre de 2026.

## Fuentes

- Ley 21.719 y disposiciones transitorias: https://www.bcn.cl/leychile/navegar?idNorma=1209272
- Estado legislativo del boletín 18.623-07: https://tramitacion.senado.cl/appsenado/index.php?ac=ultimos_vistos&mo=tramitacion
- Propuesta de modificación del calendario: https://www.economia.gob.cl/2026/09/01/gobierno-propone-ampliar-plazo-para-implementar-nueva-ley-de-proteccion-de-datos-y-institucionalidad.htm
- Delitos informáticos, Ley 21.459: https://www.bcn.cl/leychile/navegar?i=1177743
- Garantías constitucionales: https://www.bcn.cl/leychile/navegar?idNorma=242302
- Admisibilidad ante la CIDH: https://www.oas.org/es/cidh/atencion/preguntas-frecuentes.asp
- DDI y CRIN: https://www.propiedadintelectual.gob.cl/servicios/1-inscribe-obras y https://crin.propiedadintelectual.gob.cl/
- Propiedad intelectual, Ley 17.336: https://www.bcn.cl/leychile/navegar?idNorma=28933

Se consultaron los materiales de AltLegal suministrados por el cliente: presentación
de la Ley 21.719 aplicada (7 de octubre), taller de casos (21 de agosto), taller
RAT (9 de septiembre) y manual del Registro de Actividades de Tratamiento. Se
utilizaron como referencia para diseñar el alcance del servicio, sin republicar
los documentos, sus ejercicios, datos de contacto ni sus instrucciones.

El texto de las páginas es una redacción nueva. No atribuye al estudio casos,
resultados, certificaciones ni especializaciones que no hayan sido acreditados.
La ficha digital usa "hostigamiento en línea" y "protección de la honra y vida
privada" sin calificarlos automáticamente como un delito informático.

El material de RAT contiene explicaciones con distintos alcances. Se conserva
la distinción entre una herramienta de gestión y una obligación general expresa
equivalente al artículo 30 del RGPD. No se trasladan automáticamente requisitos
europeos a todos los sitios chilenos.

La fecha de vigencia debe revisarse al modificar el contenido: un proyecto
aprobado por una cámara no equivale a una reforma promulgada y publicada.
El aviso público y la fecha de revisión se pueden editar desde el administrador.

## Edición y publicación

Las tarjetas se guardan en `site_content.content.services.items`. Los campos
`clickable`, `pageSlug`, `topics` y `showOnHome` controlan enlaces y visibilidad.
Un servicio desactivado no muestra enlaces ni áreas cliqueables. Los destinos
deben existir y estar publicados.

Las páginas y su SEO se guardan en `service_pages`, con RLS y escritura limitada
al servidor autenticado. Los borradores no se entregan en consultas públicas.
`noindex` no es un control de privacidad: software es público por enlace, pero
se sirve con `noindex, follow` y se excluye del sitemap. Para contenido privado,
usar el estado borrador y la vista previa protegida.

Las URL se fijan al crear la página para evitar enlaces rotos. El contenido,
SEO, estado, referencias, imagen, revisión, etapas y preguntas son editables.
La propuesta SEO automática completa solo campos vacíos.

Los JSON de `content/` sirven como contenido inicial y respaldo de desarrollo.
No deben usarse para sobrescribir cambios editoriales posteriores. Las semillas
SQL usan `ON CONFLICT DO NOTHING` para conservar las páginas existentes.

## Imagen referencial

`public/assets/services/pages/proteccion-datos.png` se generó con la herramienta
integrada de imágenes. Representa una revisión de flujos de datos en una oficina;
no retrata al equipo real del estudio. Se conservó el archivo original sin
reducir su resolución. Los ocho símbolos del diseñador permanecen en SVG; el
nuevo símbolo digital combina vectores de Lucide en el mismo color dorado.

`public/assets/services/pages/derechos-humanos.png` es una segunda imagen
referencial generada de arquitectura cívica; no se presenta como fotografía de
un tribunal específico ni de clientes del estudio.

Prompt de la imagen: "Wide horizontal editorial photograph for a Chilean law
firm: a contemporary Santiago office, laptop with an abstract data-flow diagram,
professionals reviewing a paper data inventory, natural daylight, charcoal,
white and restrained brass accents, realistic materials, landscape 16:9.
No readable text, logos, watermarks or cyber-security holograms."

Prompt de la segunda imagen: "Wide 16:9 editorial architectural photograph of
a dignified civic courthouse inspired by Chilean civic architecture, pale stone
columns and steps, warm morning light and unidentifiable people walking near
the entrance. Accessible justice, credible proportions, natural colors, dark
architectural shadow at the left for a title. No lettering, logos, flags or
watermarks; no claim of a specific real building."

## Verificación

`node --experimental-strip-types --test tests/*.test.mjs` cubre las semillas,
tarjetas desactivadas, destinos publicados, visibilidad en inicio, exclusión
de software del sitemap, URL seguras y texto de guía del editor de noticias.
Completar también las pruebas de guardado, borradores, SEO y vista móvil/PC.
