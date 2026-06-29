import type { Metadata } from "next";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";
import { listMembers } from "@/lib/members";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description: "Conoce a Bosich Legal, estudio jurídico con trayectoria desde 2012 y equipo multidisciplinario para servicios legales en Concepción, Santiago y Valdivia.",
  alternates: { canonical: "/sobre-nosotros" },
};

export default async function AboutPage() {
  const content = await getSiteContent();
  const members = await listMembers(content);

  return (
    <>
      <Hero
        eyebrow="Trayectoria desde 2012"
        title={content.about.title}
        text="Un equipo jurídico con enfoque técnico, preventivo y contencioso."
        image={content.about.heroImage}
      />
      <section className="section content-flow">
        {content.about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
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
                <img className="team-photo" src={member.photo_url} alt={member.name} />
              ) : (
                <h3>{member.name}</h3>
              )}
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
