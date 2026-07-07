import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getNewsPostBySlug } from "@/lib/news";

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
  if (!post) return { title: "Noticia no encontrada" };

  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: `/noticias/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      type: "article",
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getNewsPostBySlug(slug);
  if (!post) notFound();

  const date = formatDate(post.published_at || post.created_at || null);

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
    </article>
  );
}
