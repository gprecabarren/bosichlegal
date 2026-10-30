begin;

alter table public.news_posts add column if not exists deleted_at timestamptz;
alter table public.service_pages add column if not exists deleted_at timestamptz;
alter table public.team_members add column if not exists deleted_at timestamptz;
alter table public.contact_submissions add column if not exists deleted_at timestamptz;
alter table public.properties add column if not exists noindex boolean not null default false;

create index if not exists news_posts_trash_idx on public.news_posts (deleted_at) where deleted_at is not null;
create index if not exists service_pages_trash_idx on public.service_pages (deleted_at) where deleted_at is not null;
create index if not exists team_members_trash_idx on public.team_members (deleted_at) where deleted_at is not null;
create index if not exists contact_submissions_trash_idx on public.contact_submissions (deleted_at) where deleted_at is not null;

-- Keep the existing server-only permissions on news, contacts and team data.
-- Service pages are public only while published and outside the recycle bin.
drop policy if exists "Only published service pages are public" on public.service_pages;
create policy "Only published service pages are public" on public.service_pages
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null);

commit;
