import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, Scale } from "lucide-react";
import { ContactCta } from "@/components/ContactCta";
import { Hero } from "@/components/Hero";
import { ServiceIcon } from "@/components/ServiceIcon";
import { getSiteContent } from "@/lib/content";
import { listNewsPosts } from "@/lib/news";

export default async function HomePage() {
  const [content, latestNews] = await Promise.all([getSiteContent(), listNewsPosts({ limit: 3 })]);
  const featured = content.services.items.slice(0, 4);

  return (
    <>
      <Hero
        eyebrow="Abogados en Concepción, Santiago y Valdivia"
        title={content.home.heroTitle}
        text={content.home.heroSubtitle}
        image={content.home.heroImage}
        actions={
          <>
            <a className="button" href={content.contact.social.whatsapp} target="_blank">
              Hablar por WhatsApp
              <ArrowRight size={18} />
            </a>
            <Link className="button button-secondary" href="/servicios">
              Ver servicios
            </Link>
          </>
        }
      />

      <section className="section intro-grid">
        <div>
          <p className="eyebrow">Estudio jurídico</p>
          <h2>{content.home.introTitle}</h2>
          <p>{content.home.introText}</p>
        </div>
        <div className="metric-panel">
          <div><Scale /> Litigios complejos</div>
          <div><BriefcaseBusiness /> Empresas y personas</div>
          <div><Building2 /> Presencia regional</div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="section-heading">
          <p className="eyebrow">Áreas de práctica</p>
          <h2>Servicios jurídicos principales</h2>
          <Link href="/servicios">Ver todas las áreas <ArrowRight size={16} /></Link>
        </div>
        <div className="service-grid">
          {featured.map((service) => (
            <article className="service-card" key={service.title}>
              <div className="service-card-icon"><ServiceIcon title={service.title} /></div>
              <h3>{service.title}</h3>
              <ul>
                {service.details.slice(0, 3).map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="statement-band">
        <div>
          <p className="eyebrow">Estrategia legal</p>
          <h2>Rigor técnico, comunicación clara y defensa activa.</h2>
        </div>
      </section>

      {latestNews.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Noticias</p>
              <h2>Actualidad jurídica</h2>
            </div>
            <Link href="/noticias">Ver noticias <ArrowRight size={16} /></Link>
          </div>
          <div className="news-grid news-grid-compact">
            {latestNews.map((post) => (
              <article className="news-card" key={post.id}>
                {post.cover_image_url ? <img src={post.cover_image_url} alt={post.title} /> : null}
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link href={`/noticias/${post.slug}`}>
                    Leer noticia <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <ContactCta content={content} />
    </>
  );
}
