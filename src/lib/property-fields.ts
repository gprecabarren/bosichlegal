import type { PropertyInput } from "@/types/property";

export const regions = [
  { id: "arica-parinacota", name: "Arica y Parinacota" },
  { id: "tarapaca", name: "Tarapacá" },
  { id: "antofagasta", name: "Antofagasta" },
  { id: "atacama", name: "Atacama" },
  { id: "coquimbo", name: "Coquimbo" },
  { id: "valparaiso", name: "Valparaíso" },
  { id: "metropolitana", name: "Metropolitana de Santiago" },
  { id: "ohiggins", name: "Libertador General Bernardo O'Higgins" },
  { id: "maule", name: "Maule" },
  { id: "nuble", name: "Ñuble" },
  { id: "biobio", name: "Biobío" },
  { id: "araucania", name: "La Araucanía" },
  { id: "los-rios", name: "Los Ríos" },
  { id: "los-lagos", name: "Los Lagos" },
  { id: "aysen", name: "Aysén del General Carlos Ibáñez del Campo" },
  { id: "magallanes", name: "Magallanes y de la Antártica Chilena" },
] as const;

export const propertyTypes = ["Casa", "Departamento", "Terreno", "Parcela", "Oficina", "Local comercial", "Otro"];
export const propertyStatuses = { draft: "Borrador", published: "En venta", sold: "Vendida" };

export function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function regionName(id: string) {
  return regions.find((region) => region.id === id)?.name || id;
}

export function propertyPrice(property: Pick<PropertyInput, "price" | "currency">) {
  if (property.price === null) return "Precio a consultar";
  const amount = new Intl.NumberFormat("es-CL", { maximumFractionDigits: property.currency === "UF" ? 2 : 0 }).format(property.price);
  return property.currency === "UF" ? `UF ${amount}` : `$ ${amount}`;
}

export function locationPath(region: string, city?: string) {
  return `/propiedades/ubicacion/${region}${city ? `/${slugify(city)}` : ""}`;
}

export function emptyProperty(): PropertyInput {
  return {
    title: "", slug: "", description: "", region: "biobio", city: "", address: "",
    property_type: "Casa", price: null, currency: "CLP", bedrooms: null,
    bathrooms: null, area_m2: null, land_m2: null, images: [], status: "draft",
    seo_title: "", meta_description: "", noindex: false,
  };
}

export function validateProperty(value: unknown): PropertyInput {
  if (!value || typeof value !== "object") throw new Error("Los datos de la propiedad no son válidos.");
  const data = value as Record<string, unknown>;
  function text(key: string, max: number, required = false) {
    if (typeof data[key] !== "string") throw new Error(`Revisa el campo ${key}.`);
    const result = (data[key] as string).trim();
    if ((required && !result) || result.length > max) throw new Error(`Revisa el campo ${key}: ${required ? "es obligatorio y " : ""}admite hasta ${max} caracteres.`);
    return result;
  }
  function number(key: string, integer = false) {
    const result = data[key];
    if (result === null || result === "" || result === undefined) return null;
    if (typeof result !== "number" || !Number.isFinite(result) || result < 0 || result > 1e12 || (integer && (!Number.isInteger(result) || result > 1000))) {
      throw new Error("Revisa el precio, superficie y número de habitaciones.");
    }
    return result;
  }
  const title = text("title", 180, true);
  const slug = slugify(text("slug", 180) || title);
  if (!slug || ["ubicacion", "nueva"].includes(slug)) throw new Error("Elige otro enlace para la propiedad.");
  if (!regions.some(({ id }) => id === data.region)) throw new Error("Selecciona una región válida.");
  if (!propertyTypes.includes(String(data.property_type))) throw new Error("Selecciona el tipo de propiedad.");
  if (data.currency !== "CLP" && data.currency !== "UF") throw new Error("Selecciona CLP o UF.");
  if (data.status !== "draft" && data.status !== "published" && data.status !== "sold") throw new Error("Selecciona un estado válido.");
  if (data.noindex !== undefined && typeof data.noindex !== "boolean") throw new Error("Revisa la opción de indexación.");
  if (!Array.isArray(data.images) || data.images.length > 20) throw new Error("La galería admite hasta 20 imágenes.");
  const images = data.images.map((image) => {
    if (!image || typeof image.url !== "string" || typeof image.alt !== "string" || typeof image.caption !== "string"
      || image.url.length > 2000 || image.alt.length > 200 || image.caption.length > 500) throw new Error("Revisa los datos de las imágenes.");
    return { url: image.url, alt: image.alt.trim(), caption: image.caption.trim() };
  });
  if (data.status !== "draft" && images.length === 0) throw new Error("Agrega al menos una fotografía antes de publicar.");
  return {
    title, slug, description: text("description", 20000, true), region: String(data.region),
    city: text("city", 100, true), address: text("address", 250), property_type: String(data.property_type),
    price: number("price"), currency: data.currency, bedrooms: number("bedrooms", true), bathrooms: number("bathrooms", true),
    area_m2: number("area_m2"), land_m2: number("land_m2"), images, status: data.status,
    seo_title: text("seo_title", 180), meta_description: text("meta_description", 320), noindex: data.noindex === true,
  };
}
