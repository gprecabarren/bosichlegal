import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SiteContent } from "@/types/site";

export function HomeHero({ content }: { content: SiteContent }) {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <img src="/assets/site/home-hero.png" alt="Bosich Legal Estudio Jurídico" />
      <div className="home-hero-copy">
        <h1 id="home-title">{content.home.heroTitle}</h1>
        <p>{content.home.heroSubtitle}</p>
      </div>
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
