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
