import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";
import { ContactCaseForm } from "./ContactCaseForm";
import { staticPageSeo } from "@/lib/static-page-seo";
import { getPageContent } from "@/lib/page-content";

export async function generateMetadata(): Promise<Metadata> { return staticPageSeo({ title: "Agenda una consulta jurídica presencial u online", description: "Cuéntanos tu caso y coordina una consulta con Bosich Legal. Atención en Concepción y Santiago, y modalidad remota. Contacto por formulario, teléfono y WhatsApp.", path: "/contacto", image: "/assets/site/contact-hero.png" }); }

export default async function ContactPage() {
  const content = await getSiteContent();
  const { text, values } = getPageContent(content, "/contacto");

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
      <section className="section contact-layout">
        <ContactCaseForm turnstileSiteKey={content.integrations?.turnstileSiteKey} copy={values} />
        <div className="contact-card">
          <h2>{text("contactTitle")}</h2>
          <a href={`tel:${content.contact.phone.replaceAll(" ", "")}`}><Phone /> {content.contact.phone}</a>
          <a href={`mailto:${content.contact.email}`}><Mail /> {content.contact.email}</a>
          <a href={content.contact.social.whatsapp} target="_blank"><MessageCircle /> {text("whatsappLabel")}</a>
        </div>
        <div className="contact-card hours-card">
          <h2>{text("hoursTitle")}</h2>
          {content.contact.hours.map((hour) => (
            <p key={hour}>{hour}</p>
          ))}
        </div>
      </section>
      <ContactCta content={content} path="/contacto" />
    </>
  );
}
