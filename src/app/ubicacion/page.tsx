import type { Metadata } from "next";
import { ExternalLink, MapPin } from "lucide-react";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ubicación",
  description: "Oficinas de Bosich Legal en Concepción, Santiago y Valdivia. Atención jurídica para personas y empresas.",
  alternates: { canonical: "/ubicacion" },
};

export default async function LocationPage() {
  const content = await getSiteContent();

  return (
    <>
      <Hero
        eyebrow="Presencia en Chile"
        title="Ubicación"
        text="Atención jurídica en Concepción, Santiago y Valdivia."
        image={content.home.heroImage}
      />
      <section className="section">
        <div className="location-grid">
          {content.locations.items.map((location) => (
            <article className="location-card" key={location.city}>
              <MapPin />
              <h2>{location.city}</h2>
              <p>{location.address}</p>
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

