import { ArrowRight, MessageCircle } from "lucide-react";
import type { SiteContent } from "@/types/site";

export function ContactCta({ content }: { content: SiteContent }) {
  return (
    <section className="cta-band">
      <div>
        <p className="eyebrow">Atención legal</p>
        <h2>{content.cta.title}</h2>
        <p>{content.cta.text}</p>
      </div>
      <a className="button button-light" href={content.contact.social.whatsapp} target="_blank">
        <MessageCircle size={18} />
        {content.cta.button}
        <ArrowRight size={18} />
      </a>
    </section>
  );
}

