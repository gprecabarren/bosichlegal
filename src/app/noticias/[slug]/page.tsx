import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getNewsPostBySlug } from "@/lib/news";
import { siteUrl } from "@/lib/content";
import { canonicalUrl, jsonLd, pageSeo } from "@/lib/page-seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("es-CL", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) return { title: "Noticia no encontrada", robots: { index: false } };

  return {
    ...pageSeo({ title: post.seo_title || post.title, description: post.meta_description || post.excerpt || post.title, path: post.canonical_url || `/noticias/${post.slug}`, image: post.cover_image_url || undefined, noindex: post.noindex }),
    keywords: post.focus_keyword ? [post.focus_keyword] : undefined,
    openGraph: {
      title: post.og_title || post.seo_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt || undefined,
      type: "article",
      url: canonicalUrl(post.canonical_url || `/noticias/${post.slug}`), locale: "es_CL", siteName: "Bosich Legal",
      publishedTime: post.published_at || post.created_at, modifiedTime: post.updated_at || undefined,
      images: [{ url: post.cover_image_url || "/assets/site/home-hero.png", alt: post.title }],
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) notFound();

  const date = formatDate(post.published_at || post.created_at || null);
  const articleUrl = canonicalUrl(post.canonical_url || `/noticias/${post.slug}`);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.seo_title || post.title,
    description: post.meta_description || post.excerpt || undefined,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    image: post.cover_image_url || undefined,
    inLanguage: "es-CL",
    author: { "@id": `${siteUrl()}/#estudio` },
    publisher: { "@id": `${siteUrl()}/#estudio` },
  };

  return (
    <article className="news-detail">
      <header className="news-detail-hero">
        <div>
          <Link href="/noticias" className="back-link">
            <ArrowLeft size={16} /> Volver a noticias
          </Link>
          <p className="eyebrow">Noticias</p>
          <h1>{post.title}</h1>
          {post.excerpt ? <p>{post.excerpt}</p> : null}
          {date ? <time dateTime={post.published_at || post.created_at}>{date}</time> : null}
        </div>
        {post.cover_image_url ? <img src={post.cover_image_url} alt={post.title} /> : null}
      </header>
      <div className="news-body" dangerouslySetInnerHTML={{ __html: post.content_html }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleSchema) }} />
    </article>
  );
}
