import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, Scale } from "lucide-react";
import { ContactCta } from "@/components/ContactCta";
import { HomeHero } from "@/components/HomeHero";
import { ServiceCard } from "@/components/ServiceCard";
import { listServicePages } from "@/lib/service-pages";
import { getSiteContent } from "@/lib/content";
import { listNewsPosts } from "@/lib/news";
import { staticPageSeo } from "@/lib/static-page-seo";

export async function generateMetadata() {
  const content = await getSiteContent();
  return staticPageSeo({ title: content.seo.title, description: content.seo.description, path: "/" });
}

export default async function HomePage() {
  const [content, latestNews, servicePages] = await Promise.all([getSiteContent(), listNewsPosts({ limit: 3 }), listServicePages()]);
  const featured = content.services.items.filter(service => service.showOnHome !== false);

  return (
    <>
      <HomeHero content={content} />

      <section className="section intro-grid">
        <div>
          <p className="eyebrow">Estudio jurídico</p>
          <h1 id="home-title" className="home-intro-title">{content.home.heroTitle}</h1>
          <p className="home-intro-lead">{content.home.heroSubtitle}</p>
          <h2 className="home-intro-subtitle">{content.home.introTitle}</h2>
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
          <h2>{content.services.homeTitle || "Servicios jurídicos principales"}</h2>
          <Link href="/servicios">Ver todas las áreas <ArrowRight size={16} /></Link>
        </div>
        <div className="service-grid">
          {featured.map((service, index) => (
            <ServiceCard key={service.title} service={service} pages={servicePages} index={index} compact />
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
                {post.cover_image_url ? <img src={post.cover_image_url} alt={post.title} loading="lazy" decoding="async" /> : null}
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

      <ContactCta content={content} featured />
    </>
  );
}
