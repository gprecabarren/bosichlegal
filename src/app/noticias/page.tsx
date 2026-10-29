import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { getSiteContent } from "@/lib/content";
import { listNewsPosts } from "@/lib/news";
import { pageSeo } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageSeo({ title: "Noticias y análisis jurídico en Chile", description: "Actualidad jurídica, comentarios y publicaciones de Bosich Legal para personas y empresas en Chile. Revisa las fuentes y la fecha de cada artículo.", path: "/noticias", image: "/assets/site/services-hero.png" });

function formatDate(value: string | null) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function NewsPage() {
  const [content, posts] = await Promise.all([getSiteContent(), listNewsPosts()]);

  return (
    <>
      <Hero
        eyebrow="Actualidad jurídica"
        title="Noticias"
        text="Publicaciones, comentarios legales y novedades relevantes para personas y empresas."
        image="/assets/site/services-hero.png"
        compact
      />
      <section className="section news-index">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Bosich Legal</p>
            <h2>Últimas publicaciones</h2>
          </div>
        </div>
        {posts.length === 0 ? (
          <div className="empty-state">
            <h3>Pronto publicaremos nuevas noticias</h3>
            <p>{content.cta.text}</p>
          </div>
        ) : (
          <div className="news-grid">
            {posts.map((post) => (
              <article className="news-card" key={post.id}>
                {post.cover_image_url ? <img src={post.cover_image_url} alt={post.title} loading="lazy" decoding="async" /> : null}
                <div>
                  <time dateTime={post.published_at || post.created_at}>{formatDate(post.published_at || post.created_at || null)}</time>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link href={`/noticias/${post.slug}`}>
                    Leer noticia <ArrowRight size={16} />
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
