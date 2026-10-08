-- Certificates: an image (or PDF) of each certificate with a short bilingual description.
create table portfolio.certificates (
  id uuid primary key default gen_random_uuid(),
  title_th text, title_en text,
  issuer_th text, issuer_en text,
  description_th text, description_en text,
  issued text,                    -- free text, e.g. "March 2026" or "2025"
  image_url text,                 -- picture of the certificate (shown on the site)
  file_url text,                  -- optional PDF / original file
  credential_url text,            -- optional verification link
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table portfolio.certificates enable row level security;
create policy "public read certificates" on portfolio.certificates for select using (true);
create policy "owner write certificates" on portfolio.certificates for all
  using (portfolio.is_owner()) with check (portfolio.is_owner());

grant select on portfolio.certificates to anon, authenticated;
grant insert, update, delete on portfolio.certificates to authenticated;
grant all on portfolio.certificates to service_role;
