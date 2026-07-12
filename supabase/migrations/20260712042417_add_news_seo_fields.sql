alter table public.news_posts
  add column if not exists seo_title text,
  add column if not exists meta_description text,
  add column if not exists focus_keyword text,
  add column if not exists canonical_url text,
  add column if not exists og_title text,
  add column if not exists og_description text,
  add column if not exists noindex boolean not null default false;

create index if not exists news_posts_public_seo_idx
  on public.news_posts (status, noindex, published_at desc);
