import type { PageFieldValue, SiteContent, StaticPagePath, StaticPageSeo } from "../types/site";

type LegacySection = "home" | "about" | "services" | "locations";
export type PageField = {
  key: string;
  label: string;
  group: string;
  type: "text" | "textarea" | "image" | "lines";
  fallback: PageFieldValue;
  legacy?: [LegacySection, string];
  maxLength: number;
  required?: boolean;
};
type PageDefinition = {
  id: string;
  path: StaticPagePath;
  label: string;
  fields: PageField[];
  seo: { title: string; description: string; image: string };
  links: { href: string; label: string }[];
};

function field(key: string, label: string, fallback: PageFieldValue, group = "Presentación", type: PageField["type"] = "text", legacy?: PageField["legacy"]): PageField {
  return { key, label, fallback, group, type, legacy, maxLength: type === "lines" ? 12000 : type === "textarea" ? 6000 : type === "image" ? 2000 : 300, required: ["title", "heroImage"].includes(key) };
}
const ctaFields = [
  field("ctaEyebrow", "Antetítulo", "Atención legal", "Contacto al pie"),
  field("ctaTitle", "Título", "", "Contacto al pie"),
  field("ctaText", "Texto", "", "Contacto al pie", "textarea"),
  field("ctaButton", "Botón de WhatsApp", "", "Contacto al pie"),
];
const contactSettings = { href: "/admin/contenido", label: "Contacto, horarios, redes y configuración general" };
const serviceLinks = [{ href: "/admin/servicios", label: "Tarjetas de servicios" }, { href: "/admin/servicios/paginas", label: "Páginas de servicios" }];
const serviceDescription = "Asesoría preventiva, representación judicial y estrategia legal para personas, empresas e instituciones.";
const subjects = ["Derecho penal", "Derecho civil", "Derecho corporativo", "Derecho laboral", "Derecho de familia", "Derecho administrativo", "Derecho ambiental", "Derechos humanos", "Derecho digital y protección de datos", "Inscripción de software", "Otra materia"];

export const staticPages: PageDefinition[] = [
  { id: "inicio", path: "/", label: "Inicio", seo: { title: "", description: "", image: "/assets/site/home-hero.png" }, links: [...serviceLinks, { href: "/admin/crear-blog", label: "Publicaciones de noticias" }, contactSettings], fields: [
    field("heroImage", "Imagen principal", "/assets/site/home-hero.png", "Presentación", "image", ["home", "heroImage"]),
    field("heroAlt", "Texto alternativo de imagen", "Bosich Legal Estudio Jurídico"),
    field("heroLabel", "Nombre accesible del encabezado", "Bosich Legal, estudio jurídico"),
    field("whatsappButton", "Botón de WhatsApp", "Hablar por WhatsApp"), field("servicesButton", "Botón de servicios", "Ver servicios"),
    field("eyebrow", "Antetítulo", "Estudio jurídico", "Introducción"),
    field("title", "Título principal", "", "Introducción", "text", ["home", "heroTitle"]),
    field("description", "Bajada principal", "", "Introducción", "textarea", ["home", "heroSubtitle"]),
    field("introTitle", "Título de introducción", "", "Introducción", "text", ["home", "introTitle"]),
    field("introText", "Texto de introducción", "", "Introducción", "textarea", ["home", "introText"]),
    field("metricLitigation", "Primera especialidad", "Litigios complejos", "Introducción"), field("metricClients", "Segunda especialidad", "Empresas y personas", "Introducción"), field("metricPresence", "Tercera especialidad", "Presencia regional", "Introducción"),
    field("servicesEyebrow", "Antetítulo", "Áreas de práctica", "Servicios"), field("servicesTitle", "Título", "Servicios jurídicos principales", "Servicios", "text", ["services", "homeTitle"]), field("allServicesButton", "Enlace a servicios", "Ver todas las áreas", "Servicios"),
    field("statementEyebrow", "Antetítulo", "Estrategia legal", "Declaración"), field("statementTitle", "Título", "Rigor técnico, comunicación clara y defensa activa.", "Declaración"),
    field("newsEyebrow", "Antetítulo", "Noticias", "Noticias"), field("newsTitle", "Título", "Actualidad jurídica", "Noticias"), field("allNewsButton", "Enlace a noticias", "Ver noticias", "Noticias"), field("readNewsButton", "Enlace de cada noticia", "Leer noticia", "Noticias"),
    ...ctaFields, field("ctaImage", "Imagen", "/assets/site/lady-justice.png", "Contacto al pie", "image"), field("ctaImageAlt", "Texto alternativo", "Estatua de la justicia con balanza", "Contacto al pie"),
  ] },
  { id: "servicios", path: "/servicios", label: "Servicios", seo: { title: "Servicios jurídicos para personas y empresas", description: "Servicios jurídicos en derecho civil, penal, corporativo, administrativo, ambiental, concursal y propiedad para clientes en Concepción, Santiago y Valdivia.", image: "/assets/site/services-hero.png" }, links: [...serviceLinks, contactSettings], fields: [
    field("eyebrow", "Antetítulo", "Áreas de práctica"), field("title", "Título principal", "Servicios", "Presentación", "text", ["services", "title"]), field("description", "Bajada", serviceDescription, "Presentación", "textarea", ["services", "description"]), field("heroImage", "Imagen principal", "/assets/site/services-hero.png", "Presentación", "image", ["services", "heroImage"]), field("heroAlt", "Texto alternativo", "Bosich Legal, estudio jurídico"),
    field("introEyebrow", "Antetítulo", "Bosich Legal", "Servicios"), field("introTitle", "Título", "Práctica integral para personas y empresas", "Servicios", "text", ["services", "introTitle"]), field("serviceButton", "Enlace de cada servicio", "Ver más información", "Servicios"), ...ctaFields,
  ] },
  { id: "sobre-nosotros", path: "/sobre-nosotros", label: "Sobre nosotros", seo: { title: "Nuestro equipo de abogados", description: "Conoce al equipo de Bosich Legal y su trayectoria desde 2012. Asesoría y litigación en Concepción y Santiago, con atención remota para clientes en Chile.", image: "/assets/site/about-hero.png" }, links: [{ href: "/admin/miembros", label: "Miembros del equipo" }, contactSettings], fields: [
    field("eyebrow", "Antetítulo", "Trayectoria desde 2012"), field("title", "Título principal", "Sobre nosotros", "Presentación", "text", ["about", "title"]), field("description", "Bajada", "Un equipo jurídico con enfoque técnico, preventivo y contencioso.", "Presentación", "textarea"), field("heroImage", "Imagen principal", "/assets/site/about-hero.png", "Presentación", "image", ["about", "heroImage"]), field("heroAlt", "Texto alternativo", "Bosich Legal, estudio jurídico"),
    field("storyImage", "Imagen de trayectoria", "/assets/site/about-statue.png", "Trayectoria", "image"), field("storyAlt", "Texto alternativo", "Figura de la justicia", "Trayectoria"), field("paragraphs", "Párrafos, uno por línea", [], "Trayectoria", "lines", ["about", "paragraphs"]), field("teamEyebrow", "Antetítulo", "Equipo", "Equipo"), field("teamTitle", "Título", "Áreas y especialidades", "Equipo"), ...ctaFields,
  ] },
  { id: "ubicacion", path: "/ubicacion", label: "Ubicación", seo: { title: "Oficinas en Concepción y Santiago y atención online", description: "Encuentra las oficinas de Bosich Legal en Concepción, Santiago y Valdivia. Coordina una reunión presencial o una consulta jurídica por videollamada.", image: "/assets/site/location-hero.png" }, links: [contactSettings], fields: [
    field("eyebrow", "Antetítulo", "Presencia en Chile"), field("title", "Título principal", "Ubicación", "Presentación", "text", ["locations", "title"]), field("description", "Bajada", "Oficinas en Concepción, Santiago y Valdivia. Consultas presenciales con coordinación previa y atención remota para clientes en Chile.", "Presentación", "textarea"), field("heroImage", "Imagen principal", "/assets/site/location-hero.png", "Presentación", "image"), field("heroAlt", "Texto alternativo", "Bosich Legal, estudio jurídico"), field("mapButton", "Enlace al mapa", "Abrir en Google Maps", "Oficinas"), ...ctaFields,
  ] },
  { id: "contacto", path: "/contacto", label: "Contacto", seo: { title: "Agenda una consulta jurídica presencial u online", description: "Cuéntanos tu caso y coordina una consulta con Bosich Legal. Atención en Concepción y Santiago, y modalidad remota. Contacto por formulario, teléfono y WhatsApp.", image: "/assets/site/contact-hero.png" }, links: [contactSettings, { href: "/admin/solicitudes-contacto", label: "Solicitudes recibidas" }], fields: [
    field("eyebrow", "Antetítulo", "Hablemos de tu caso"), field("title", "Título principal", "Contacto"), field("description", "Bajada", "Cuéntanos la materia, tu ciudad y si existe un plazo urgente. Coordinaremos una consulta presencial en nuestras oficinas o una reunión remota, según tu situación.", "Presentación", "textarea"), field("heroImage", "Imagen principal", "/assets/site/contact-hero.png", "Presentación", "image"), field("heroAlt", "Texto alternativo", "Bosich Legal, estudio jurídico"),
    field("contactTitle", "Título de contacto", "Información de contacto", "Datos de contacto"), field("whatsappLabel", "Enlace WhatsApp", "WhatsApp", "Datos de contacto"), field("hoursTitle", "Título de horarios", "Horarios de atención", "Datos de contacto"),
    field("formEyebrow", "Antetítulo", "Formulario seguro", "Formulario"), field("formTitle", "Título", "Cuéntanos tu caso", "Formulario"), field("nameLabel", "Nombre", "Nombre completo", "Formulario"), field("emailLabel", "Correo", "Correo electrónico", "Formulario"), field("phoneLabel", "Teléfono", "Teléfono", "Formulario"), field("subjectLabel", "Materia", "Materia", "Formulario"), field("subjectPlaceholder", "Opción inicial", "Selecciona una materia", "Formulario"), field("subjects", "Materias, una por línea", subjects, "Formulario", "lines"), field("messageLabel", "Descripción", "Breve descripción del caso", "Formulario"), field("messagePlaceholder", "Ejemplo de descripción", "Incluye ciudad, materia y cualquier plazo o audiencia relevante. No ingreses claves ni información bancaria.", "Formulario", "textarea"), field("consentLabel", "Autorización", "Autorizo a Bosich Legal a contactarme por este caso. Este formulario no constituye patrocinio ni representación legal hasta que exista una aceptación expresa del estudio.", "Formulario", "textarea"), field("submitButton", "Botón de envío", "Enviar caso", "Formulario"), field("pendingButton", "Botón durante envío", "Enviando...", "Formulario"), ...ctaFields,
  ] },
  { id: "noticias", path: "/noticias", label: "Noticias", seo: { title: "Noticias y análisis jurídico en Chile", description: "Actualidad jurídica, comentarios y publicaciones de Bosich Legal para personas y empresas en Chile. Revisa las fuentes y la fecha de cada artículo.", image: "/assets/site/services-hero.png" }, links: [{ href: "/admin/crear-blog", label: "Publicaciones de noticias" }, contactSettings], fields: [
    field("eyebrow", "Antetítulo", "Actualidad jurídica"), field("title", "Título principal", "Noticias"), field("description", "Bajada", "Publicaciones, comentarios legales y novedades relevantes para personas y empresas.", "Presentación", "textarea"), field("heroImage", "Imagen principal", "/assets/site/services-hero.png", "Presentación", "image"), field("heroAlt", "Texto alternativo", "Bosich Legal, estudio jurídico"), field("listEyebrow", "Antetítulo", "Bosich Legal", "Publicaciones"), field("listTitle", "Título", "Últimas publicaciones", "Publicaciones"), field("emptyTitle", "Título sin noticias", "Pronto publicaremos nuevas noticias", "Publicaciones"), field("emptyText", "Texto sin noticias", "", "Publicaciones", "textarea"), field("readButton", "Enlace de noticia", "Leer noticia", "Publicaciones"), field("noDate", "Fecha no disponible", "Sin fecha", "Publicaciones"),
  ] },
  { id: "propiedades", path: "/propiedades", label: "Propiedades", seo: { title: "Propiedades en venta", description: "Propiedades en venta con Bosich Legal. Revisa fotografías, características, precios y ubicaciones por ciudad y región en Chile.", image: "/assets/site/home-hero.png" }, links: [{ href: "/admin/propiedades", label: "Fichas de propiedades" }], fields: [
    field("eyebrow", "Antetítulo", "Bosich Legal"), field("title", "Título principal", "Propiedades en venta"), field("description", "Bajada", "Encuentra tu próxima propiedad.", "Presentación", "textarea"),
    ...Object.entries({ singular: ["Resultado singular", "propiedad"], plural: ["Resultado plural", "propiedades"], allButton: ["Limpiar filtros", "Ver todas"], filteredEmpty: ["Sin coincidencias", "No hay propiedades con estos filtros"], emptyTitle: ["Sin propiedades", "Próximamente, propiedades en venta"], emptyText: ["Texto sin resultados", "Contáctanos para conocer las oportunidades disponibles."], contactButton: ["Enlace de contacto", "Consultar a Bosich Legal"], detailButton: ["Enlace de propiedad", "Ver propiedad"], locationTitle: ["Título por ubicación", "Explorar por ubicación"], locationLabel: ["Nombre accesible de ubicaciones", "Propiedades por ubicación"], bedroomsLabel: ["Dormitorios", "dorm."], bathroomsLabel: ["Baños", "baños"], regionLabel: ["Región", "Región"], allRegions: ["Todas las regiones", "Todas las regiones"], cityLabel: ["Ciudad", "Ciudad"], allCities: ["Todas las ciudades", "Todas las ciudades"], typeLabel: ["Tipo", "Tipo"], allTypes: ["Todos los tipos", "Todos los tipos"], statusLabel: ["Estado", "Estado"], allStatuses: ["Todos los estados", "Todas"], publishedLabel: ["Estado en venta", "En venta"], soldLabel: ["Estado vendido", "Vendidas"], searchButton: ["Botón de búsqueda", "Buscar"] }).map(([key, [label, value]]) => field(key, label, value, "Catálogo y filtros")),
  ] },
];

export function getStaticPage(idOrPath: string) {
  return staticPages.find(page => page.id === idOrPath || page.path === idOrPath);
}

export function getPageContent(content: SiteContent, path: StaticPagePath) {
  const page = getStaticPage(path)!;
  const values: Record<string, PageFieldValue> = {};
  for (const spec of page.fields) {
    const legacy = spec.legacy ? (content[spec.legacy[0]] as unknown as Record<string, PageFieldValue>)[spec.legacy[1]] : undefined;
    const shared = spec.key === "ctaTitle" ? content.cta.title : spec.key === "ctaText" || spec.key === "emptyText" && path === "/noticias" ? content.cta.text : spec.key === "ctaButton" ? content.cta.button : undefined;
    values[spec.key] = content.pages?.[path]?.content?.[spec.key] ?? (legacy || shared || spec.fallback);
  }
  return {
    values,
    text: (key: string) => typeof values[key] === "string" ? values[key] as string : "",
    lines: (key: string) => Array.isArray(values[key]) ? values[key] as string[] : [],
  };
}

export function getPageSeo(content: SiteContent, path: StaticPagePath) {
  const page = getStaticPage(path)!;
  const overrides = content.pages?.[path]?.seo;
  const copy = getPageContent(content, path);
  const title = overrides?.title?.trim() || (path === "/" ? content.seo.title : page.seo.title);
  const description = overrides?.description?.trim() || (path === "/" ? content.seo.description : path === "/servicios" ? content.services.description || page.seo.description : page.seo.description);
  return { title, description, canonical: overrides?.canonical?.trim() || path, ogTitle: overrides?.ogTitle?.trim() || title, ogDescription: overrides?.ogDescription?.trim() || description, image: overrides?.ogImage?.trim() || copy.text("heroImage") || page.seo.image, imageAlt: copy.text("heroAlt") || "Bosich Legal, estudio jurídico", noindex: content.seo.noindexPaths === undefined ? Boolean(overrides?.noindex) : content.seo.noindexPaths.includes(path) };
}

export const pageSeoFields = [
  { key: "title", label: "Título SEO", maxLength: 180 }, { key: "description", label: "Descripción SEO", maxLength: 320 },
  { key: "canonical", label: "URL canónica", maxLength: 2000 }, { key: "ogTitle", label: "Título para compartir", maxLength: 180 },
  { key: "ogDescription", label: "Descripción para compartir", maxLength: 320 }, { key: "ogImage", label: "Imagen para compartir", maxLength: 2000 },
] as const;

export function validPageUrl(value: string, image = false) {
  if (!value || /[\s\\\u0000-\u001f]/.test(value)) return false;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password && (!image || Boolean(url.hostname)); } catch { return false; }
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export type PageContentPatch = { fields: Record<string, PageFieldValue>; offices?: SiteContent["locations"]["items"] };

export function validatePageContent(path: StaticPagePath, input: unknown): asserts input is PageContentPatch {
  const page = getStaticPage(path);
  if (!page || !object(input) || !object(input.fields) || Object.keys(input).some(key => !["fields", "offices"].includes(key))) throw new Error("Contenido de página no válido.");
  for (const [key, value] of Object.entries(input.fields)) {
    const spec = page.fields.find(field => field.key === key);
    if (!spec) throw new Error(`Campo no permitido: ${key}.`);
    if (spec.type === "lines") {
      if (!Array.isArray(value) || value.length > 60 || value.some(line => typeof line !== "string" || line.length > (key === "subjects" ? 120 : 6000)) || value.join("\n").length > spec.maxLength) throw new Error(`${spec.label}: listado no válido.`);
      if (key === "subjects" && (!value.length || value.some(line => line.trim().length < 3) || new Set(value.map(line => line.trim())).size !== value.length)) throw new Error("Las materias deben ser únicas y tener al menos tres caracteres.");
    } else if (typeof value !== "string" || value.length > spec.maxLength || spec.required && !value.trim() || spec.type === "image" && value && !validPageUrl(value, true)) throw new Error(`${spec.label}: valor no válido.`);
  }
  if (input.offices !== undefined) {
    if (path !== "/ubicacion" || !Array.isArray(input.offices) || input.offices.length > 20) throw new Error("Oficinas no válidas.");
    for (const office of input.offices) {
      if (!object(office) || Object.keys(office).some(key => !["city", "address", "mapQuery"].includes(key)) || ["city", "address", "mapQuery"].some(key => typeof office[key] !== "string" || !(office[key] as string).trim() || (office[key] as string).length > 500)) throw new Error("Completa ciudad, dirección y búsqueda de mapa en cada oficina.");
    }
  }
}

export function validatePageSeo(input: unknown): asserts input is StaticPageSeo {
  if (!object(input) || Object.keys(input).some(key => key !== "noindex" && !pageSeoFields.some(field => field.key === key))) throw new Error("SEO no válido.");
  if (input.noindex !== undefined && typeof input.noindex !== "boolean") throw new Error("Indexación no válida.");
  for (const field of pageSeoFields) {
    const value = input[field.key];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.length > field.maxLength || value && ["canonical", "ogImage"].includes(field.key) && !validPageUrl(value, field.key === "ogImage")) throw new Error(`${field.label}: valor no válido.`);
  }
}

// Apply only submitted fields to a fresh snapshot, never the editor's whole site.
export function patchPageContent(current: SiteContent, path: StaticPagePath, patch: PageContentPatch): SiteContent {
  validatePageContent(path, patch);
  const next = { ...current, pages: { ...current.pages } };
  const previous = next.pages[path];
  const values = { ...previous?.content };
  for (const [key, value] of Object.entries(patch.fields)) {
    const spec = getStaticPage(path)!.fields.find(field => field.key === key)!;
    if (spec.legacy) {
      const [section, name] = spec.legacy;
      Object.assign(next, { [section]: { ...next[section], [name]: value } });
      delete values[key];
    } else values[key] = value;
  }
  next.pages[path] = { ...previous, content: values };
  if (patch.offices) {
    next.locations = { ...next.locations, items: patch.offices.map(office => ({ ...office })) };
    next.contact = { ...next.contact, addresses: patch.offices.map(office => office.address) };
  }
  return next;
}

export function patchPageSeo(current: SiteContent, path: StaticPagePath, patch: StaticPageSeo): SiteContent {
  if (!getStaticPage(path)) throw new Error("Página no válida.");
  validatePageSeo(patch);
  const seo = { ...current.pages?.[path]?.seo, ...patch };
  delete seo.noindex;
  const next = { ...current, pages: { ...current.pages, [path]: { ...current.pages?.[path], seo } }, seo: { ...current.seo } };
  // Home metadata continues to round-trip through the legacy general settings.
  if (path === "/") {
    if (patch.title !== undefined && patch.title.trim()) next.seo.title = patch.title.trim();
    if (patch.description !== undefined && patch.description.trim()) next.seo.description = patch.description.trim();
    delete seo.title;
    delete seo.description;
  }
  if (patch.noindex !== undefined) {
    const paths = new Set(current.seo.noindexPaths ?? staticPages.filter(page => current.pages?.[page.path]?.seo?.noindex).map(page => page.path));
    if (patch.noindex) paths.add(path); else paths.delete(path);
    next.seo.noindexPaths = [...paths];
  }
  return next;
}
