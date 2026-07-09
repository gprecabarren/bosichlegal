export type NewsStatus = "draft" | "published";

export type NewsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  cover_image_url: string | null;
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
  status: NewsStatus;
};

export type NewsActionState = {
  ok: boolean;
  message: string;
  values: NewsFormValues;
  resetKey: string;
} | null;
