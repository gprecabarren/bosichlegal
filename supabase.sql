-- Bosich Legal dedicated Supabase schema.
-- Run this only in the separate Bosich Legal Supabase project.

create extension if not exists "pgcrypto";

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  focus text not null,
  photo_url text,
  sort_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'contacted', 'archived')),
  source_path text,
  ip_hash text,
  user_agent text,
  email_sent boolean not null default false,
  email_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_html text not null,
  cover_image_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists team_members_name_role_unique_idx
  on public.team_members (name, role);

create index if not exists team_members_public_order_idx
  on public.team_members (is_active, sort_order, created_at);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

create index if not exists contact_submissions_status_created_idx
  on public.contact_submissions (status, created_at desc);

create index if not exists contact_submissions_ip_created_idx
  on public.contact_submissions (ip_hash, created_at desc);

create index if not exists contact_submissions_email_created_idx
  on public.contact_submissions (email, created_at desc);

create index if not exists news_posts_status_published_idx
  on public.news_posts (status, published_at desc, created_at desc);

create index if not exists news_posts_slug_idx
  on public.news_posts (slug);

alter table public.site_content enable row level security;
alter table public.team_members enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.news_posts enable row level security;

drop policy if exists "No public access" on public.site_content;
create policy "No public access"
  on public.site_content
  for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "No public access" on public.team_members;
create policy "No public access"
  on public.team_members
  for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "No public access" on public.contact_submissions;
create policy "No public access"
  on public.contact_submissions
  for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "No public access" on public.news_posts;
create policy "No public access"
  on public.news_posts
  for all
  to anon, authenticated
  using (false)
  with check (false);

do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public;
    revoke execute on function public.rls_auto_enable() from anon;
    revoke execute on function public.rls_auto_enable() from authenticated;
  end if;
end $$;

-- The Next.js server uses SUPABASE_SERVICE_ROLE_KEY only on the server side.
-- Public REST access is explicitly denied by RLS policies.

insert into public.site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-member-photos',
  'team-member-photos',
  true,
  4194304,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-images',
  'news-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into public.team_members (name, role, focus, photo_url, sort_order, is_active)
values
  ('Nicolás Bosich Medel', 'Abogado Universidad Andrés Bello', 'Fundador Bosich Legal. Dedicado a materias de derecho privado, derecho público y derecho penal.', '/assets/team/nicolas-bosich-medel.png', 1, true),
  ('Naim Hizmeri Blanco', 'Abogado Universidad Andrés Bello', 'Dedicado a materias de derecho penal y derecho comercial.', '/assets/team/naim-hizmeri-blanco.png', 2, true),
  ('Maximiliano Díaz Sepúlveda', 'Universidad de las Américas', 'Dedicado a materias de derecho inmobiliario y registral.', '/assets/team/maximiliano-diaz-sepulveda.png', 3, true),
  ('Matías Chamorro Muñoz', 'Abogado Universidad Andrés Bello', 'Dedicado a materias de derecho público y derecho laboral.', '/assets/team/matias-chamorro-munoz.png', 4, true),
  ('Conrado Meza Quiroz', 'Abogado Universidad del Desarrollo', 'Dedicado a materias de derecho penal y derecho tributario.', '/assets/team/conrado-meza-quiroz.png', 5, true),
  ('Harif Gárate Rojas', 'Abogado Universidad Andrés Bello', 'Dedicado a materias de derecho ambiental, civil y penal.', '/assets/team/harif-garate-rojas.png', 6, true),
  ('Camila Sagredo Muñoz', 'Abogada Universidad Andrés Bello', 'Dedicada a materias de derecho de familia y derecho laboral.', '/assets/team/camila-sagredo-munoz.png', 7, true),
  ('Sara Hernández Cepeda', 'Abogada Universidad Andrés Bello', 'Dedicada a materias de derechos humanos y derecho internacional.', '/assets/team/sara-hernandez-cepeda.png', 8, true),
  ('Claudia Mansilla Muñoz', 'Abogada Universidad Andrés Bello', 'Dedicada a materias de derecho laboral, contrato de seguro y ley de extranjería.', '/assets/team/claudia-mansilla-munoz.png', 9, true),
  ('Ricardo Sepúlveda Sepúlveda', 'Licenciado en Derecho UCSC', 'Dedicado a materias de accidentes de tránsito y fraude bancario.', '/assets/team/ricardo-sepulveda-sepulveda.png', 10, true),
  ('Javiera Fernández Gómez', 'Abogada Universidad Andrés Bello', 'Dedicada a materias de derecho de familia y derecho civil.', '/assets/team/javiera-fernandez-gomez.png', 11, true),
  ('Génesis Zúñiga Tapia', 'Abogada UCSC', 'Dedicada a materias de derecho del consumidor y derecho corporativo.', '/assets/team/genesis-zuniga-tapia.png', 12, true)
on conflict (name, role) do update
set focus = excluded.focus,
    photo_url = excluded.photo_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = now();
