import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { ServiceCard } from "@/components/ServiceCard";
import { listServicePages } from "@/lib/service-pages";
import { getSiteContent } from "@/lib/content";
import { pageSeo } from "@/lib/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const { services } = await getSiteContent();
  return pageSeo({
    title: "Servicios jurídicos para personas y empresas",
    description: services.description || "Servicios jurídicos en derecho civil, penal, corporativo, administrativo, ambiental, concursal y propiedad para clientes en Concepción, Santiago y Valdivia.",
    path: "/servicios", image: services.heroImage,
  });
}

export default async function ServicesPage() {
  const [content, pages] = await Promise.all([getSiteContent(), listServicePages()]);

  return (
    <>
      <Hero
        eyebrow="Áreas de práctica"
        title={content.services.title}
        text={content.services.description || "Asesoría preventiva, representación judicial y estrategia legal para personas, empresas e instituciones."}
        image={content.services.heroImage}
        compact
      />
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">Bosich Legal</p>
          <h2>{content.services.introTitle || "Práctica integral para personas y empresas"}</h2>
        </div>
        <div className="service-grid service-grid-wide">
          {content.services.items.map((service, index) => (
            <ServiceCard key={service.title} service={service} pages={pages} index={index} />
          ))}
        </div>
      </section>
      <ContactCta content={content} />
    </>
  );
}
