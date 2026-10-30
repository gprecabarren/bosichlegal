import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SiteContent } from "@/types/site";
import { getPageContent } from "@/lib/page-content";

export function HomeHero({ content }: { content: SiteContent }) {
  const { text } = getPageContent(content, "/");
  return (
    <section className="home-hero" aria-label={text("heroLabel")}>
      <img src={text("heroImage")} alt={text("heroAlt")} width={1920} height={624} fetchPriority="high" />
      <div className="home-hero-buttons">
        <a className="button" href={content.contact.social.whatsapp} target="_blank" rel="noreferrer">
          {text("whatsappButton")}
          <ArrowRight size={18} />
        </a>
        <Link className="button button-secondary" href="/servicios">
          {text("servicesButton")}
        </Link>
      </div>
    </section>
  );
}
