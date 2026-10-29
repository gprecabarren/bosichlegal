import type { Metadata } from "next";
import { ExternalLink, MapPin } from "lucide-react";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";
import { staticPageSeo } from "@/lib/static-page-seo";

export async function generateMetadata(): Promise<Metadata> { return staticPageSeo({ title: "Oficinas en Concepción y Santiago y atención online", description: "Encuentra las oficinas de Bosich Legal en Concepción, Santiago y Valdivia. Coordina una reunión presencial o una consulta jurídica por videollamada.", path: "/ubicacion", image: "/assets/site/location-hero.png" }); }

export default async function LocationPage() {
  const content = await getSiteContent();

  return (
    <>
      <Hero
        eyebrow="Presencia en Chile"
        title="Ubicación"
        text="Oficinas en Concepción, Santiago y Valdivia. Consultas presenciales con coordinación previa y atención remota para clientes en Chile."
        image="/assets/site/location-hero.png"
        compact
      />
      <section className="section">
        <div className="location-grid">
          {content.locations.items.map((location) => (
            <article className="location-card" key={location.city}>
              <iframe
                title={`Mapa oficina ${location.city}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(location.mapQuery)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="location-copy">
                <MapPin />
                <h2>{location.city}</h2>
                <p>{location.address}</p>
              </div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapQuery)}`} target="_blank">
                Abrir en Google Maps
                <ExternalLink size={16} />
              </a>
            </article>
          ))}
        </div>
      </section>
      <ContactCta content={content} />
    </>
  );
}
