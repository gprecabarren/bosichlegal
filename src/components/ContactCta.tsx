import { ArrowRight, MessageCircle } from "lucide-react";
import type { SiteContent, StaticPagePath } from "@/types/site";
import { getPageContent } from "@/lib/page-content";

export function ContactCta({ content, featured = false, path }: { content: SiteContent; featured?: boolean; path?: StaticPagePath }) {
  const copy = path ? getPageContent(content, path) : undefined;
  return (
    <section className={featured ? "cta-band cta-band-featured" : "cta-band"}>
      {featured ? (
        <img className="cta-image" src={copy?.text("ctaImage") ?? "/assets/site/lady-justice.png"} alt={copy?.text("ctaImageAlt") ?? "Estatua de la justicia con balanza"} width={720} height={720} loading="lazy" decoding="async" />
      ) : null}
      <div>
        <p className="eyebrow">{copy?.text("ctaEyebrow") ?? "Atención legal"}</p>
        <h2>{copy?.text("ctaTitle") ?? content.cta.title}</h2>
        <p>{copy?.text("ctaText") ?? content.cta.text}</p>
      </div>
      <a className="button button-light" href={content.contact.social.whatsapp} target="_blank" rel="noreferrer">
        <MessageCircle size={18} />
        {copy?.text("ctaButton") ?? content.cta.button}
        <ArrowRight size={18} />
      </a>
    </section>
  );
}
