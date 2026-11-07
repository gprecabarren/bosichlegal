# Derecho Tributario

## Publicacion

- Pagina editable: `/servicios/derecho-tributario`.
- Acceso corto `/derecho-tributario`: redireccion permanente a la pagina canonica, sin contenido duplicado.
- Tarjeta en inicio y catalogo, con las cuatro materias solicitadas.
- Icono vectorial SVG, dorado `#d8ac80`, con motivos Landmark y ReceiptText de Lucide y licencia incluida. No tiene rasterizados ni pierde resolucion al ampliarse.
- El editor existente administra texto, imagen, secciones, preguntas frecuentes, estado e indexacion.

## Fuentes revisadas el 6 de noviembre de 2026

- SII, Circular 35 de 2026: https://www.sii.cl/normativa_legislacion/circulares/2026/circu35.pdf
- TTA, procedimiento general: https://www.tta.cl/procedimiento-general-de-reclamaciones-tributarias/
- SII, Circular 23 de 2025: https://www.sii.cl/normativa_legislacion/circulares/2025/circu23.pdf
- SII, posesion efectiva: https://www.sii.cl/preguntas_frecuentes/herencias/001_160_2714.htm

El contenido no fija plazos procesales universales, promete ahorro tributario ni garantiza resultados. Distingue la defensa administrativa del reclamo judicial y la posesion efectiva de las obligaciones tributarias sucesorias. La auditoria preventiva se presenta como revision juridico-tributaria con alcance acordado, no como certificacion o auditoria financiera independiente.

## Datos

El contenido inicial esta en `content/service-pages.json`; la tarjeta de respaldo esta en `content/site.json`. La pagina se publico desde el propio panel. La tarjeta se agrega con `scripts/add-tax-service-card.sql`, una operacion idempotente que preserva el resto del contenido y evita duplicados. No hubo cambios de esquema, permisos ni claves.
