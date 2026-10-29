import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SiteContent } from "@/types/site";

export function HomeHero({ content }: { content: SiteContent }) {
  return (
    <section className="home-hero" aria-label="Bosich Legal, estudio jurídico">
      <img src="/assets/site/home-hero.png" alt="Bosich Legal Estudio Jurídico" width={1920} height={624} fetchPriority="high" />
      <div className="home-hero-buttons">
        <a className="button" href={content.contact.social.whatsapp} target="_blank" rel="noreferrer">
          Hablar por WhatsApp
          <ArrowRight size={18} />
        </a>
        <Link className="button button-secondary" href="/servicios">
          Ver servicios
        </Link>
      </div>
    </section>
  );
}
