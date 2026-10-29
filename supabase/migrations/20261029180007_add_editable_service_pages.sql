create table public.service_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 1 and 180),
  status text not null default 'draft' check (status in ('draft', 'published')),
  noindex boolean not null default true,
  seo_title text not null default '',
  meta_description text not null default '',
  focus_keyword text not null default '',
  og_title text not null default '',
  og_description text not null default '',
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.service_pages enable row level security;
revoke all on public.service_pages from anon, authenticated;
grant select on public.service_pages to anon, authenticated;
grant all on public.service_pages to service_role;
create policy "Only published service pages are public"
  on public.service_pages for select to anon, authenticated
  using (status = 'published');
create index service_pages_public_idx on public.service_pages (created_at) where status = 'published';
