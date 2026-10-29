import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";
import { ContactCaseForm } from "./ContactCaseForm";
import { staticPageSeo } from "@/lib/static-page-seo";

export async function generateMetadata(): Promise<Metadata> { return staticPageSeo({ title: "Agenda una consulta jurídica presencial u online", description: "Cuéntanos tu caso y coordina una consulta con Bosich Legal. Atención en Concepción y Santiago, y modalidad remota. Contacto por formulario, teléfono y WhatsApp.", path: "/contacto", image: "/assets/site/contact-hero.png" }); }

export default async function ContactPage() {
  const content = await getSiteContent();

  return (
    <>
      <Hero
        eyebrow="Hablemos de tu caso"
        title="Contacto"
        text="Cuéntanos la materia, tu ciudad y si existe un plazo urgente. Coordinaremos una consulta presencial en nuestras oficinas o una reunión remota, según tu situación."
        image="/assets/site/contact-hero.png"
        compact
      />
      <section className="section contact-layout">
        <ContactCaseForm turnstileSiteKey={content.integrations?.turnstileSiteKey} />
        <div className="contact-card">
          <h2>Información de contacto</h2>
          <a href={`tel:${content.contact.phone.replaceAll(" ", "")}`}><Phone /> {content.contact.phone}</a>
          <a href={`mailto:${content.contact.email}`}><Mail /> {content.contact.email}</a>
          <a href={content.contact.social.whatsapp} target="_blank"><MessageCircle /> WhatsApp</a>
        </div>
        <div className="contact-card hours-card">
          <h2>Horarios de atención</h2>
          {content.contact.hours.map((hour) => (
            <p key={hour}>{hour}</p>
          ))}
        </div>
      </section>
      <ContactCta content={content} />
    </>
  );
}
