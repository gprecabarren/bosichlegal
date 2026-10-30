import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { ServiceCard } from "@/components/ServiceCard";
import { listServicePages } from "@/lib/service-pages";
import { getSiteContent } from "@/lib/content";
import { staticPageSeo } from "@/lib/static-page-seo";
import { getPageContent } from "@/lib/page-content";

export async function generateMetadata(): Promise<Metadata> {
  const { services } = await getSiteContent();
  return staticPageSeo({
    title: "Servicios jurídicos para personas y empresas",
    description: services.description || "Servicios jurídicos en derecho civil, penal, corporativo, administrativo, ambiental, concursal y propiedad para clientes en Concepción, Santiago y Valdivia.",
    path: "/servicios", image: services.heroImage,
  });
}

export default async function ServicesPage() {
  const [content, pages] = await Promise.all([getSiteContent(), listServicePages()]);
  const { text } = getPageContent(content, "/servicios");

  return (
    <>
      <Hero
        eyebrow={text("eyebrow")}
        title={text("title")}
        text={text("description")}
        image={text("heroImage")}
        imageAlt={text("heroAlt")}
        compact
      />
      <section className="section">
        <div className="section-heading">
          <p className="eyebrow">{text("introEyebrow")}</p>
          <h2>{text("introTitle")}</h2>
        </div>
        <div className="service-grid service-grid-wide">
          {content.services.items.map((service, index) => (
            <ServiceCard key={service.title} service={service} pages={pages} index={index} buttonLabel={text("serviceButton")} />
          ))}
        </div>
      </section>
      <ContactCta content={content} path="/servicios" />
    </>
  );
}
