import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Servicios jurídicos",
  description: "Servicios jurídicos en derecho civil, penal, corporativo, administrativo, ambiental, concursal y propiedad para clientes en Concepción, Santiago y Valdivia.",
  alternates: { canonical: "/servicios" },
};

export default async function ServicesPage() {
  const content = await getSiteContent();

  return (
    <>
      <Hero
        eyebrow="Áreas de práctica"
        title="Servicios jurídicos"
        text="Asesoría preventiva, representación judicial y estrategia legal para asuntos de alta complejidad."
        image={content.services.heroImage}
      />
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Bosich Legal</p>
          <h2>Práctica integral para personas y empresas</h2>
        </div>
        <div className="service-grid service-grid-wide">
          {content.services.items.map((service) => (
            <article className="service-card" key={service.title}>
              <h3>{service.title}</h3>
              <ul>
                {service.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <ContactCta content={content} />
    </>
  );
}

