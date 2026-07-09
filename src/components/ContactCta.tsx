import { ArrowRight, MessageCircle } from "lucide-react";
import type { SiteContent } from "@/types/site";

export function ContactCta({ content, featured = false }: { content: SiteContent; featured?: boolean }) {
  return (
    <section className={featured ? "cta-band cta-band-featured" : "cta-band"}>
      {featured ? (
        <img className="cta-image" src="/assets/site/lady-justice.png" alt="Estatua de la justicia con balanza" />
      ) : null}
      <div>
        <p className="eyebrow">Atención legal</p>
        <h2>{content.cta.title}</h2>
        <p>{content.cta.text}</p>
      </div>
      <a className="button button-light" href={content.contact.social.whatsapp} target="_blank" rel="noreferrer">
        <MessageCircle size={18} />
        {content.cta.button}
        <ArrowRight size={18} />
      </a>
    </section>
  );
}
