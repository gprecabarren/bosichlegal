import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";
import { listMembers } from "@/lib/members";
import { staticPageSeo } from "@/lib/static-page-seo";

export async function generateMetadata(): Promise<Metadata> { return staticPageSeo({ title: "Nuestro equipo de abogados", description: "Conoce al equipo de Bosich Legal y su trayectoria desde 2012. Asesoría y litigación en Concepción y Santiago, con atención remota para clientes en Chile.", path: "/sobre-nosotros", image: "/assets/site/about-hero.png" }); }

export default async function AboutPage() {
  const content = await getSiteContent();
  const members = await listMembers(content);

  return (
    <>
      <Hero
        eyebrow="Trayectoria desde 2012"
        title={content.about.title}
        text="Un equipo jurídico con enfoque técnico, preventivo y contencioso."
        image="/assets/site/about-hero.png"
        compact
      />
      <section className="section about-story">
        <img src="/assets/site/about-statue.png" alt="Figura de la justicia" loading="lazy" decoding="async" />
        <div className="content-flow">
          {content.about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
      <section className="section section-muted">
        <div className="section-heading">
          <p className="eyebrow">Equipo</p>
          <h2>Áreas y especialidades</h2>
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
      <ContactCta content={content} />
    </>
  );
}
