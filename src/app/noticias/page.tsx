import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";
import { listNewsPosts } from "@/lib/news";
import { staticPageSeo } from "@/lib/static-page-seo";
import { getPageContent } from "@/lib/page-content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> { return staticPageSeo({ title: "Noticias y análisis jurídico en Chile", description: "Actualidad jurídica, comentarios y publicaciones de Bosich Legal para personas y empresas en Chile. Revisa las fuentes y la fecha de cada artículo.", path: "/noticias", image: "/assets/site/services-hero.png" }); }

function formatDate(value: string | null, noDate: string) {
  if (!value) return noDate;
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function NewsPage() {
  const [content, posts] = await Promise.all([getSiteContent(), listNewsPosts()]);
  const { text } = getPageContent(content, "/noticias");

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
      <section className="section news-index">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text("listEyebrow")}</p>
            <h2>{text("listTitle")}</h2>
          </div>
        </div>
        {posts.length === 0 ? (
          <div className="empty-state">
            <h3>{text("emptyTitle")}</h3>
            <p>{text("emptyText")}</p>
          </div>
        ) : (
          <div className="news-grid">
            {posts.map((post) => (
              <article className="news-card" key={post.id}>
                {post.cover_image_url ? <img src={post.cover_image_url} alt={post.title} loading="lazy" decoding="async" /> : null}
                <div>
                  <time dateTime={post.published_at || post.created_at}>{formatDate(post.published_at || post.created_at || null, text("noDate"))}</time>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link href={`/noticias/${post.slug}`}>
                    {text("readButton")} <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
