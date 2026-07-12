export type NewsStatus = "draft" | "published";

export type NewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  cover_image_url: string | null;
  seo_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  noindex: boolean;
  status: NewsStatus;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NewsFormValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  cover_image_url: string;
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  noindex: boolean;
  status: NewsStatus;
};

export type NewsActionState = {
  ok: boolean;
  message: string;
  values: NewsFormValues;
  resetKey: string;
} | null;
