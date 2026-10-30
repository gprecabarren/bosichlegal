import Link from "next/link";
import { ArrowRight, Bath, BedDouble, Building2, MapPin, Ruler } from "lucide-react";
import { locationPath, propertyPrice, propertyStatuses, regionName, slugify } from "@/lib/property-fields";
import type { Property } from "@/types/property";
import { PropertyFilters, type PropertyFilterValues } from "./PropertyFilters";
import type { PageFieldValue } from "@/types/site";

export function PropertyCatalog({ properties, selected = {}, copy = {} }: { properties: Property[]; selected?: PropertyFilterValues; copy?: Record<string, PageFieldValue> }) {
  const text = (key: string, fallback: string) => typeof copy[key] === "string" ? copy[key] as string : fallback;
  const filtered = properties.filter((property) => (!selected.region || property.region === selected.region)
    && (!selected.city || slugify(property.city) === slugify(selected.city))
    && (!selected.type || property.property_type === selected.type)
    && (!selected.status || property.status === selected.status));
  const availableRegions = [...new Set(properties.map((property) => property.region))];
  const locationCities = [...new Map(properties.filter((property) => !selected.region || property.region === selected.region)
    .map((property) => [`${property.region}/${slugify(property.city)}`, property])).values()];
  return <section className="section property-catalog">
    <PropertyFilters locations={properties.map(({ region, city }) => ({ region, city }))} selected={selected} copy={copy} />
    <div className="property-results-heading"><h2>{filtered.length} {filtered.length === 1 ? text("singular", "propiedad") : text("plural", "propiedades")}</h2>
      {Object.values(selected).some(Boolean) ? <Link className="back-link" href="/propiedades">{text("allButton", "Ver todas")}</Link> : null}
    </div>
    {filtered.length === 0 ? <div className="property-empty"><Building2 size={36} strokeWidth={1.3} /><h3>{properties.length ? text("filteredEmpty", "No hay propiedades con estos filtros") : text("emptyTitle", "Próximamente, propiedades en venta")}</h3><p>{text("emptyText", "Contáctanos para conocer las oportunidades disponibles.")}</p><Link className="back-link" href="/contacto">{text("contactButton", "Consultar a Bosich Legal")}<ArrowRight size={16} /></Link></div> : null}
    <div className="property-grid">{filtered.map((property) => <article className="property-card" key={property.id}>
      <Link className="property-card-photo" href={`/propiedades/${property.slug}`} aria-label={property.title}>
        {property.images[0] ? <img src={property.images[0].url} alt={property.images[0].alt || property.title} loading="lazy" /> : <Building2 size={48} />}
        <span className={`property-status property-status-${property.status}`}>{propertyStatuses[property.status]}</span>
      </Link>
      <div className="property-card-body"><p className="property-type">{property.property_type}</p><h3><Link href={`/propiedades/${property.slug}`}>{property.title}</Link></h3>
        <p className="property-location"><MapPin size={16} />{property.city}, {regionName(property.region)}</p>
        <p className="property-price">{propertyPrice(property)}</p>
        <div className="property-features">{property.bedrooms !== null ? <span><BedDouble size={17} />{property.bedrooms} {text("bedroomsLabel", "dorm.")}</span> : null}{property.bathrooms !== null ? <span><Bath size={17} />{property.bathrooms} {text("bathroomsLabel", "baños")}</span> : null}{(property.area_m2 ?? property.land_m2) !== null ? <span><Ruler size={17} />{property.area_m2 ?? property.land_m2} m²</span> : null}</div>
        <Link className="back-link" href={`/propiedades/${property.slug}`}>{text("detailButton", "Ver propiedad")}<ArrowRight size={16} /></Link>
      </div>
    </article>)}</div>
    {availableRegions.length ? <nav className="property-location-links" aria-label={text("locationLabel", "Propiedades por ubicación")}><h2>{text("locationTitle", "Explorar por ubicación")}</h2><div>{availableRegions.map((region) => <Link key={region} href={locationPath(region)}>{regionName(region)}</Link>)}</div><div>{locationCities.map((property) => <Link key={`${property.region}/${property.city}`} href={locationPath(property.region, property.city)}>{property.city}</Link>)}</div></nav> : null}
  </section>;
}
