import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";
import { listMembers } from "@/lib/members";
import { staticPageSeo } from "@/lib/static-page-seo";
import { getPageContent } from "@/lib/page-content";

export async function generateMetadata(): Promise<Metadata> { return staticPageSeo({ title: "Nuestro equipo de abogados", description: "Conoce al equipo de Bosich Legal y su trayectoria desde 2012. Asesoría y litigación en Concepción y Santiago, con atención remota para clientes en Chile.", path: "/sobre-nosotros", image: "/assets/site/about-hero.png" }); }

export default async function AboutPage() {
  const content = await getSiteContent();
  const members = await listMembers(content);
  const { text, lines } = getPageContent(content, "/sobre-nosotros");

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
      <section className="section about-story">
        <img src={text("storyImage")} alt={text("storyAlt")} loading="lazy" decoding="async" />
        <div className="content-flow">
          {lines("paragraphs").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>
      <section className="section section-muted">
        <div className="section-heading">
          <p className="eyebrow">{text("teamEyebrow")}</p>
          <h2>{text("teamTitle")}</h2>
        </div>
        <div className="team-grid">
          {members.map((member) => (
            <article className="team-card" key={`${member.name}-${member.role}`}>
              {member.photo_url ? (
                <img className="team-photo" src={member.photo_url} alt={member.name} loading="lazy" decoding="async" />
              ) : null}
              <h3>{member.name}</h3>
              <p className="role">{member.role}</p>
              <p>{member.focus}</p>
            </article>
          ))}
        </div>
      </section>
      <ContactCta content={content} path="/sobre-nosotros" />
    </>
  );
}
