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

create unique index if not exists team_members_name_role_unique_idx
  on public.team_members (name, role);

create index if not exists team_members_public_order_idx
  on public.team_members (is_active, sort_order, created_at);

alter table public.site_content enable row level security;
alter table public.team_members enable row level security;

-- No public table policies are created on purpose.
-- The Next.js server uses SUPABASE_SERVICE_ROLE_KEY only on the server side.

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

insert into public.team_members (name, role, focus, sort_order, is_active)
values
  ('Fundador Bosich Legal', 'Abogado Universidad Andrés Bello', 'Derecho privado, derecho público y derecho penal.', 1, true),
  ('Área Penal y Comercial', 'Abogado Universidad Andrés Bello', 'Derecho penal y derecho comercial.', 2, true),
  ('Área Inmobiliaria y Registral', 'Universidad de las Américas', 'Derecho inmobiliario y registral.', 3, true),
  ('Área Pública y Laboral', 'Abogado Universidad Andrés Bello', 'Derecho público y derecho laboral.', 4, true),
  ('Área Tributaria y Penal', 'Abogado Universidad del Desarrollo', 'Derecho penal y derecho tributario.', 5, true),
  ('Área Ambiental, Civil y Penal', 'Abogado Universidad Andrés Bello', 'Derecho ambiental, civil y penal.', 6, true),
  ('Área Familia y Laboral', 'Abogada Universidad Andrés Bello', 'Derecho de familia y derecho laboral.', 7, true),
  ('Área Derechos Humanos', 'Abogada Universidad Andrés Bello', 'Derechos humanos y derecho internacional.', 8, true),
  ('Área Laboral y Extranjería', 'Abogada Universidad Andrés Bello', 'Derecho laboral, contrato de seguro y ley de extranjería.', 9, true),
  ('Área Familia y Civil', 'Abogada Universidad Andrés Bello', 'Derecho de familia y derecho civil.', 10, true),
  ('Área Accidentes y Fraude Bancario', 'Licenciado en Derecho UCSC', 'Accidentes de tránsito y fraude bancario.', 11, true),
  ('Área Consumidor y Corporativo', 'Abogada UCSC', 'Derecho del consumidor y derecho corporativo.', 12, true)
on conflict (name, role) do update
set focus = excluded.focus,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = now();
