create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 180),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null check (char_length(description) between 1 and 20000),
  region text not null,
  city text not null check (char_length(city) between 1 and 100),
  address text not null default '',
  property_type text not null default 'Casa',
  price numeric(16,2) check (price >= 0),
  currency text not null default 'CLP' check (currency in ('CLP', 'UF')),
  bedrooms integer check (bedrooms >= 0),
  bathrooms integer check (bathrooms >= 0),
  area_m2 numeric(16,2) check (area_m2 >= 0),
  land_m2 numeric(16,2) check (land_m2 >= 0),
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array' and jsonb_array_length(images) <= 20),
  status text not null default 'draft' check (status in ('draft', 'published', 'sold')),
  seo_title text not null default '',
  meta_description text not null default '',
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists properties_public_location_idx on public.properties (region, city, created_at desc)
  where status in ('published', 'sold') and deleted_at is null;

alter table public.properties enable row level security;
revoke all on table public.properties from anon, authenticated;
grant select on table public.properties to anon, authenticated;
grant all on table public.properties to service_role;

create policy "Published properties are public" on public.properties for select to anon, authenticated
  using (status in ('published', 'sold') and deleted_at is null);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Only the authenticated application server writes to this bucket. Public
-- buckets permit image downloads without granting uploads or modifications.
