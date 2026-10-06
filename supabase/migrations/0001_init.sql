-- Panicha Portfolio — schema, RLS and storage
-- Everything lives in its own `portfolio` schema so it can share a Supabase project with other apps.
-- Visitors can read a row only when it is meant to be public.
-- Every write is restricted to owners listed in portfolio.admins.
--
-- After running: Dashboard › Project Settings › Data API › Exposed schemas → add `portfolio`.

create schema if not exists portfolio;
grant usage on schema portfolio to anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────
-- Owners
-- ─────────────────────────────────────────────────────────────
create table portfolio.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table portfolio.admins enable row level security;

create or replace function portfolio.is_owner()
returns boolean
language sql
stable
security definer
set search_path = portfolio, public
as $$
  select exists (select 1 from portfolio.admins where user_id = auth.uid());
$$;
revoke all on function portfolio.is_owner() from public;
grant execute on function portfolio.is_owner() to anon, authenticated;

create policy "owners read admins" on portfolio.admins
  for select to authenticated using (user_id = auth.uid());

-- updated_at helper
create or replace function portfolio.touch_updated_at()
returns trigger language plpgsql set search_path = portfolio, public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Site settings (singleton)
-- ─────────────────────────────────────────────────────────────
create table portfolio.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'Panicha Portfolio',
  accent_color text not null default '#3b6bff' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  default_lang text not null default 'th' check (default_lang in ('th', 'en')),
  seo_title_th text, seo_title_en text,
  seo_description_th text, seo_description_en text,
  og_image_url text,
  contact_heading_th text, contact_heading_en text,
  contact_text_th text, contact_text_en text,
  footer_note_th text, footer_note_en text,
  updated_at timestamptz not null default now()
);
insert into portfolio.site_settings (id) values (1);
create trigger site_settings_touch before update on portfolio.site_settings
  for each row execute function portfolio.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Profile (singleton)
-- ─────────────────────────────────────────────────────────────
create table portfolio.profile (
  id smallint primary key default 1 check (id = 1),
  full_name_th text, full_name_en text,
  nickname_th text, nickname_en text,
  job_title_th text, job_title_en text,
  hero_title_th text, hero_title_en text,
  hero_subtitle_th text, hero_subtitle_en text,
  short_bio_th text, short_bio_en text,
  long_bio_th text, long_bio_en text,
  location_th text, location_en text,
  university_th text, university_en text,
  interests_th text, interests_en text,
  photo_url text,
  resume_url text,
  email text,
  phone text,
  website text,
  show_email boolean not null default true,
  show_phone boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into portfolio.profile (id) values (1);
create trigger profile_touch before update on portfolio.profile
  for each row execute function portfolio.touch_updated_at();

-- ─────────────────────────────────────────────────────────────
-- Categories
-- ─────────────────────────────────────────────────────────────
create table portfolio.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_th text, name_en text,
  sort_order int not null default 0,
  hidden boolean not null default false,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Projects
-- ─────────────────────────────────────────────────────────────
create type portfolio.project_status as enum ('draft', 'published', 'archived');

create table portfolio.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_th text, title_en text,
  short_th text, short_en text,
  overview_th text, overview_en text,
  problem_th text, problem_en text,
  solution_th text, solution_en text,
  my_role_th text, my_role_en text,
  process_th text, process_en text,
  features_th text, features_en text,
  result_th text, result_en text,
  awards_th text, awards_en text,
  role_th text, role_en text,
  year int check (year between 1990 and 2100),
  team_size int check (team_size between 1 and 500),
  tools text[] not null default '{}',
  tags text[] not null default '{}',
  thumbnail_url text,
  hero_url text,
  video_url text,
  github_url text,
  demo_url text,
  external_url text,
  status portfolio.project_status not null default 'draft',
  featured boolean not null default false,
  sort_order int not null default 0,
  seo_title_th text, seo_title_en text,
  seo_description_th text, seo_description_en text,
  og_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create index projects_status_order on portfolio.projects (status, sort_order);
create trigger projects_touch before update on portfolio.projects
  for each row execute function portfolio.touch_updated_at();

create or replace function portfolio.stamp_published_at()
returns trigger language plpgsql set search_path = portfolio, public as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;
create trigger projects_published before insert or update on portfolio.projects
  for each row execute function portfolio.stamp_published_at();

-- Owner-only notes kept out of the public projects table entirely.
create table portfolio.project_notes (
  project_id uuid primary key references portfolio.projects (id) on delete cascade,
  notes text
);

create table portfolio.project_categories (
  project_id uuid not null references portfolio.projects (id) on delete cascade,
  category_id uuid not null references portfolio.categories (id) on delete cascade,
  primary key (project_id, category_id)
);
create index project_categories_category on portfolio.project_categories (category_id);

create table portfolio.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references portfolio.projects (id) on delete cascade,
  url text not null,
  alt_th text, alt_en text,
  width int, height int,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index project_images_project on portfolio.project_images (project_id, sort_order);

-- ─────────────────────────────────────────────────────────────
-- About content
-- ─────────────────────────────────────────────────────────────
create table portfolio.skills (
  id uuid primary key default gen_random_uuid(),
  name_th text, name_en text,
  group_th text, group_en text,
  sort_order int not null default 0
);

create table portfolio.experiences (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'work' check (kind in ('work', 'education')),
  title_th text, title_en text,
  org_th text, org_en text,
  location_th text, location_en text,
  period text,
  description_th text, description_en text,
  sort_order int not null default 0
);

create table portfolio.awards (
  id uuid primary key default gen_random_uuid(),
  title_th text, title_en text,
  issuer_th text, issuer_en text,
  year int,
  description_th text, description_en text,
  project_id uuid references portfolio.projects (id) on delete set null,
  sort_order int not null default 0
);
create index awards_project on portfolio.awards (project_id);

create table portfolio.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text,
  url text not null check (url ~* '^(https?://|mailto:)'),
  sort_order int not null default 0
);

-- Overrides for static UI labels (key → th/en); the app ships defaults.
create table portfolio.translations (
  key text primary key,
  th text,
  en text
);

-- ─────────────────────────────────────────────────────────────
-- Contact messages
-- ─────────────────────────────────────────────────────────────
create table portfolio.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  message text not null check (char_length(message) between 1 and 5000),
  ip_hash text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index contact_messages_ip on portfolio.contact_messages (ip_hash, created_at desc);

-- Visitors never touch the table directly: they call this function, which rate-limits.
create or replace function portfolio.submit_contact_message(
  p_name text, p_email text, p_message text, p_ip_hash text
) returns text
language plpgsql
security definer
set search_path = portfolio, public
as $$
declare
  recent int;
begin
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    return 'invalid';
  end if;
  select count(*) into recent from portfolio.contact_messages
    where ip_hash = p_ip_hash and created_at > now() - interval '10 minutes';
  if recent >= 3 then
    return 'rate_limited';
  end if;
  insert into portfolio.contact_messages (name, email, message, ip_hash)
    values (left(trim(p_name), 120), left(trim(p_email), 200), left(trim(p_message), 5000), p_ip_hash);
  return 'ok';
end;
$$;
revoke all on function portfolio.submit_contact_message(text, text, text, text) from public;
grant execute on function portfolio.submit_contact_message(text, text, text, text) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────
alter table portfolio.site_settings enable row level security;
alter table portfolio.profile enable row level security;
alter table portfolio.categories enable row level security;
alter table portfolio.projects enable row level security;
alter table portfolio.project_notes enable row level security;
alter table portfolio.project_categories enable row level security;
alter table portfolio.project_images enable row level security;
alter table portfolio.skills enable row level security;
alter table portfolio.experiences enable row level security;
alter table portfolio.awards enable row level security;
alter table portfolio.social_links enable row level security;
alter table portfolio.translations enable row level security;
alter table portfolio.contact_messages enable row level security;

-- Public reads
create policy "public read settings" on portfolio.site_settings for select using (true);
create policy "public read skills" on portfolio.skills for select using (true);
create policy "public read experiences" on portfolio.experiences for select using (true);
create policy "public read awards" on portfolio.awards for select using (true);
create policy "public read social" on portfolio.social_links for select using (true);
create policy "public read translations" on portfolio.translations for select using (true);
create policy "public read categories" on portfolio.categories
  for select using (hidden = false or portfolio.is_owner());
create policy "public read projects" on portfolio.projects
  for select using (status = 'published' or portfolio.is_owner());
create policy "public read project images" on portfolio.project_images
  for select using (
    portfolio.is_owner() or exists (
      select 1 from portfolio.projects p where p.id = project_id and p.status = 'published'
    )
  );
create policy "public read project categories" on portfolio.project_categories
  for select using (
    portfolio.is_owner() or exists (
      select 1 from portfolio.projects p where p.id = project_id and p.status = 'published'
    )
  );

-- Profile: email/phone are only exposed through the public_profile view.
create policy "owner read profile" on portfolio.profile for select using (portfolio.is_owner());

create view portfolio.public_profile with (security_invoker = false) as
  select id, full_name_th, full_name_en, nickname_th, nickname_en, job_title_th, job_title_en,
         hero_title_th, hero_title_en, hero_subtitle_th, hero_subtitle_en,
         short_bio_th, short_bio_en, long_bio_th, long_bio_en, location_th, location_en,
         university_th, university_en, interests_th, interests_en,
         photo_url, resume_url, website,
         case when show_email then email end as email,
         case when show_phone then phone end as phone,
         updated_at
  from portfolio.profile;

-- Owner writes (one policy per table)
create policy "owner write settings" on portfolio.site_settings for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner write profile" on portfolio.profile for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner write categories" on portfolio.categories for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner write projects" on portfolio.projects for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner all notes" on portfolio.project_notes for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner write project categories" on portfolio.project_categories for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner write project images" on portfolio.project_images for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner write skills" on portfolio.skills for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner write experiences" on portfolio.experiences for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner write awards" on portfolio.awards for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner write social" on portfolio.social_links for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner write translations" on portfolio.translations for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner read messages" on portfolio.contact_messages for select using (portfolio.is_owner());
create policy "owner update messages" on portfolio.contact_messages for update
  using (portfolio.is_owner()) with check (portfolio.is_owner());
create policy "owner delete messages" on portfolio.contact_messages for delete using (portfolio.is_owner());

-- ─────────────────────────────────────────────────────────────
-- Storage: public-read media bucket, owner-only writes, type + size limits
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media', 'portfolio-media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'application/pdf']
)
on conflict (id) do nothing;

create policy "portfolio owner upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media' and portfolio.is_owner());
create policy "portfolio owner update media" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio-media' and portfolio.is_owner());
create policy "portfolio owner delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-media' and portfolio.is_owner());

-- ─────────────────────────────────────────────────────────────
-- Table privileges (RLS above decides which rows)
-- ─────────────────────────────────────────────────────────────
grant select on all tables in schema portfolio to anon, authenticated;
grant insert, update, delete on all tables in schema portfolio to authenticated;
grant all on all tables in schema portfolio to service_role;
-- Visitors read the profile only through portfolio.public_profile (which hides email/phone unless enabled).
revoke select on portfolio.contact_messages, portfolio.project_notes, portfolio.admins, portfolio.profile from anon;
