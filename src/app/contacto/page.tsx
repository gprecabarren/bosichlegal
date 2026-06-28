import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta a Bosich Legal para servicios jurídicos en Concepción, Santiago y Valdivia. Atención por WhatsApp, teléfono y correo.",
  alternates: { canonical: "/contacto" },
};

export default async function ContactPage() {
  const content = await getSiteContent();

  return (
    <>
      <Hero
        eyebrow="Hablemos de tu caso"
        title="Contacto"
        text="Cuéntanos qué necesitas y coordinaremos la mejor forma de ayudarte."
        image={content.home.heroImage}
      />
      <section className="section contact-layout">
        <div className="contact-card">
          <h2>Información de contacto</h2>
          <a href={`tel:${content.contact.phone.replaceAll(" ", "")}`}><Phone /> {content.contact.phone}</a>
          <a href={`mailto:${content.contact.email}`}><Mail /> {content.contact.email}</a>
          <a href={content.contact.social.whatsapp} target="_blank"><MessageCircle /> WhatsApp</a>
        </div>
        <div className="contact-card">
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

