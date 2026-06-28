"use client";

import { useActionState } from "react";
import type { SiteContent } from "@/types/site";
import { saveAdminContent } from "./actions";
import { SubmitButton } from "./SubmitButton";

function servicesToText(services: SiteContent["services"]["items"]) {
  return services.map((service) => [service.title, ...service.details].join("\n")).join("\n\n");
}

export function AdminForm({ content }: { content: SiteContent }) {
  const [state, action] = useActionState(saveAdminContent, null);

  return (
    <form className="admin-form" action={action}>
      <section>
        <h2>Acceso</h2>
        <label>
          Clave admin
          <input name="password" type="password" required placeholder="ADMIN_PASSWORD" />
        </label>
      </section>

      <section>
        <h2>SEO</h2>
        <label>
          Título SEO
          <input name="seoTitle" defaultValue={content.seo.title} />
        </label>
        <label>
          Descripción SEO
          <textarea name="seoDescription" defaultValue={content.seo.description} rows={3} />
        </label>
        <label>
          Keywords, una por línea
          <textarea name="keywords" defaultValue={content.seo.keywords.join("\n")} rows={8} />
        </label>
      </section>

      <section>
        <h2>Inicio</h2>
        <label>
          Título principal
          <input name="heroTitle" defaultValue={content.home.heroTitle} />
        </label>
        <label>
          Subtítulo principal
          <textarea name="heroSubtitle" defaultValue={content.home.heroSubtitle} rows={3} />
        </label>
        <label>
          Título introducción
          <input name="introTitle" defaultValue={content.home.introTitle} />
        </label>
        <label>
          Texto introducción
          <textarea name="introText" defaultValue={content.home.introText} rows={3} />
        </label>
      </section>

      <section>
        <h2>Sobre nosotros</h2>
        <label>
          Párrafos, uno por línea
          <textarea name="aboutParagraphs" defaultValue={content.about.paragraphs.join("\n")} rows={10} />
        </label>
      </section>

      <section>
        <h2>Servicios</h2>
        <p className="admin-help">Formato: título del servicio y debajo sus puntos. Separa cada servicio con una línea en blanco.</p>
        <label>
          Servicios
          <textarea name="services" defaultValue={servicesToText(content.services.items)} rows={18} />
        </label>
      </section>

      <section>
        <h2>Contacto y redes</h2>
        <label>
          Teléfono visible
          <input name="phone" defaultValue={content.contact.phone} />
        </label>
        <label>
          WhatsApp, solo números con código país
          <input name="whatsapp" defaultValue={content.contact.whatsapp} />
        </label>
        <label>
          Correo
          <input name="email" type="email" defaultValue={content.contact.email} />
        </label>
        <label>
          Instagram
          <input name="instagram" defaultValue={content.contact.social.instagram} placeholder="https://instagram.com/..." />
        </label>
        <label>
          LinkedIn
          <input name="linkedin" defaultValue={content.contact.social.linkedin} placeholder="https://linkedin.com/company/..." />
        </label>
        <label>
          Direcciones, una por línea
          <textarea name="addresses" defaultValue={content.contact.addresses.join("\n")} rows={5} />
        </label>
        <label>
          Horarios, uno por línea
          <textarea name="hours" defaultValue={content.contact.hours.join("\n")} rows={4} />
        </label>
      </section>

      <section>
        <h2>CTA</h2>
        <label>
          Título
          <input name="ctaTitle" defaultValue={content.cta.title} />
        </label>
        <label>
          Texto
          <textarea name="ctaText" defaultValue={content.cta.text} rows={3} />
        </label>
        <label>
          Botón
          <input name="ctaButton" defaultValue={content.cta.button} />
        </label>
      </section>

      <div className="admin-actions">
        <SubmitButton />
        {state?.message ? <p className={state.ok ? "admin-success" : "admin-error"}>{state.message}</p> : null}
      </div>
    </form>
  );
}

