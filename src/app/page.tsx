import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Building2, Scale } from "lucide-react";
import { ContactCta } from "@/components/ContactCta";
import { HomeHero } from "@/components/HomeHero";
import { ServiceCard } from "@/components/ServiceCard";
import { listServicePages } from "@/lib/service-pages";
import { getSiteContent } from "@/lib/content";
import { listNewsPosts } from "@/lib/news";
import { staticPageSeo } from "@/lib/static-page-seo";
import { getPageContent } from "@/lib/page-content";

export async function generateMetadata() {
  const content = await getSiteContent();
  return staticPageSeo({ title: content.seo.title, description: content.seo.description, path: "/" });
}

export default async function HomePage() {
  const [content, latestNews, servicePages] = await Promise.all([getSiteContent(), listNewsPosts({ limit: 3 }), listServicePages()]);
  const featured = content.services.items.filter(service => service.showOnHome !== false);
  const { text } = getPageContent(content, "/");

  return (
    <>
      <HomeHero content={content} />

      <section className="section intro-grid">
        <div>
          <p className="eyebrow">{text("eyebrow")}</p>
          <h1 id="home-title" className="home-intro-title">{text("title")}</h1>
          <p className="home-intro-lead">{text("description")}</p>
          <h2 className="home-intro-subtitle">{text("introTitle")}</h2>
          <p>{text("introText")}</p>
        </div>
        <div className="metric-panel">
          <div><Scale /> {text("metricLitigation")}</div>
          <div><BriefcaseBusiness /> {text("metricClients")}</div>
          <div><Building2 /> {text("metricPresence")}</div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="section-heading">
          <p className="eyebrow">{text("servicesEyebrow")}</p>
          <h2>{text("servicesTitle")}</h2>
          <Link href="/servicios">{text("allServicesButton")} <ArrowRight size={16} /></Link>
        </div>
        <div className="service-grid">
          {featured.map((service, index) => (
            <ServiceCard key={service.title} service={service} pages={servicePages} index={index} compact />
          ))}
        </div>
      </section>

      <section className="statement-band">
        <div>
          <p className="eyebrow">{text("statementEyebrow")}</p>
          <h2>{text("statementTitle")}</h2>
        </div>
      </section>

      {latestNews.length > 0 ? (
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{text("newsEyebrow")}</p>
              <h2>{text("newsTitle")}</h2>
            </div>
            <Link href="/noticias">{text("allNewsButton")} <ArrowRight size={16} /></Link>
          </div>
          <div className="news-grid news-grid-compact">
            {latestNews.map((post) => (
              <article className="news-card" key={post.id}>
                {post.cover_image_url ? <img src={post.cover_image_url} alt={post.title} loading="lazy" decoding="async" /> : null}
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link href={`/noticias/${post.slug}`}>
                    {text("readNewsButton")} <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <ContactCta content={content} path="/" featured />
    </>
  );
}
