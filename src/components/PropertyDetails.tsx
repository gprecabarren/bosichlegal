import Link from "next/link";
import { ArrowLeft, Bath, BedDouble, Mail, MapPin, MessageCircle, Ruler } from "lucide-react";
import { PropertyGallery } from "@/components/PropertyGallery";
import { siteUrl } from "@/lib/content";
import type { Property } from "@/types/property";
import type { SiteContent } from "@/types/site";
import { locationPath, propertyPrice, propertyStatuses, regionName } from "@/lib/property-fields";

export function PropertyDetails({ property, content }: { property: Property; content: SiteContent }) {
  const url = `${siteUrl()}/propiedades/${property.slug}`;
  const message = `Hola, quisiera consultar por la propiedad ${property.title} en ${property.city}: ${url}`;
  const whatsapp = `https://wa.me/${content.contact.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([property.address, property.city, regionName(property.region), "Chile"].filter(Boolean).join(", "))}`;
  const schema = {
    "@context": "https://schema.org", "@type": "RealEstateListing", name: property.title, description: property.description,
    url, datePosted: property.created_at, dateModified: property.updated_at, image: property.images.map((image) => image.url),
    mainEntity: { "@type": property.property_type === "Casa" ? "House" : property.property_type === "Departamento" ? "Apartment" : "Place",
      name: property.title, address: { "@type": "PostalAddress", streetAddress: property.address || undefined, addressLocality: property.city, addressRegion: regionName(property.region), addressCountry: "CL" },
      ...(property.area_m2 !== null ? { floorSize: { "@type": "QuantitativeValue", value: property.area_m2, unitCode: "MTK" } } : {}),
    },
    ...(property.price !== null && property.currency === "CLP" ? { offers: { "@type": "Offer", price: property.price, priceCurrency: "CLP", availability: property.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock", url } } : {}),
  };
  return <article className="section property-detail">
    <Link href="/propiedades" className="back-link"><ArrowLeft size={16} />Volver a propiedades</Link>
    <header className="property-detail-heading"><div><p className="eyebrow">{property.property_type}</p><h1>{property.title}</h1><p className="property-location"><MapPin size={18} /><Link href={locationPath(property.region, property.city)}>{property.city}, {regionName(property.region)}</Link></p></div><div><span className={`property-status property-status-${property.status}`}>{propertyStatuses[property.status]}</span><p className="property-price">{propertyPrice(property)}</p></div></header>
    <div className="property-detail-grid"><div><PropertyGallery images={property.images} title={property.title} />
      <div className="property-features property-detail-features">{property.bedrooms !== null ? <span><BedDouble />{property.bedrooms} dormitorios</span> : null}{property.bathrooms !== null ? <span><Bath />{property.bathrooms} baños</span> : null}{property.area_m2 !== null ? <span><Ruler />{property.area_m2} m² construidos</span> : null}{property.land_m2 !== null ? <span><Ruler />{property.land_m2} m² de terreno</span> : null}</div>
      <section className="property-description"><h2>Descripción</h2>{property.description.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>
      <section className="property-location-section"><h2>Ubicación</h2>{property.address ? <p>{property.address}</p> : null}<p>{property.city}, {regionName(property.region)}</p><a className="back-link" href={maps} target="_blank" rel="noreferrer"><MapPin size={18} />Ver en Google Maps</a></section>
    </div><aside className="property-enquiry"><h2>Consulta por esta propiedad</h2><p>Bosich Legal</p>{property.status === "sold" ? <p>Esta propiedad está vendida. Contáctanos para conocer otras opciones.</p> : null}<a className="button" href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} />Consultar por WhatsApp</a><a className="back-link" href={`mailto:${content.contact.email}?subject=${encodeURIComponent(`Consulta: ${property.title}`)}&body=${encodeURIComponent(message)}`}><Mail size={18} />{content.contact.email}</a></aside></div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
  </article>;
}
