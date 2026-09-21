create extension if not exists pgcrypto;
create extension if not exists postgis;

create type public.buyer_segment as enum ('processor', 'catering', 'distributor', 'retail', 'restaurant');
create type public.verification_status as enum ('verified', 'partial', 'needs_review');
create type public.job_status as enum ('queued', 'running', 'completed', 'failed');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'analyst', 'sales')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  commercial_name text not null,
  legal_name text,
  cuit text,
  website text,
  phone text,
  corporate_email text,
  segment public.buyer_segment,
  verification_status public.verification_status not null default 'needs_review',
  place_id text,
  normalized_domain text,
  normalized_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_cuit_format check (cuit is null or cuit ~ '^\d{2}-\d{8}-\d$')
);

create unique index companies_org_cuit_unique
  on public.companies (organization_id, cuit)
  where cuit is not null;
create index companies_org_name_idx on public.companies (organization_id, commercial_name);
create index companies_domain_idx on public.companies (organization_id, normalized_domain);

create table public.company_locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  label text not null default 'principal',
  address text,
  city text,
  province text,
  postal_code text,
  coordinates geography(point, 4326),
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index company_locations_geo_idx on public.company_locations using gist (coordinates);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_type text not null check (source_type in ('company_website', 'google_places', 'sifega', 'comprar', 'arca', 'directory', 'manual')),
  source_name text not null,
  source_url text,
  external_id text,
  retrieved_at timestamptz not null default now(),
  raw_payload jsonb,
  content_hash text,
  created_at timestamptz not null default now()
);
create index sources_external_idx on public.sources (source_type, external_id);

create table public.company_source_links (
  company_id uuid not null references public.companies(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  match_confidence numeric(4,3) not null check (match_confidence between 0 and 1),
  match_reasons text[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (company_id, source_id)
);

create table public.company_evidence (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete restrict,
  claim_key text not null,
  claim_value jsonb not null,
  excerpt text not null,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index company_evidence_company_idx on public.company_evidence (company_id, claim_key);

create table public.company_classifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_key text not null,
  buyer_segment public.buyer_segment,
  uses_product boolean,
  product_usage text check (product_usage in ('direct_raw_material', 'ingredient', 'resale', 'food_service', 'unknown')),
  evidence_strength text not null check (evidence_strength in ('direct', 'indirect', 'none')),
  volume_signal text not null check (volume_signal in ('high', 'medium', 'low', 'unknown')),
  company_size text not null check (company_size in ('large', 'medium', 'small', 'unknown')),
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  model_name text,
  prompt_version text,
  created_at timestamptz not null default now()
);
create index classifications_company_product_idx on public.company_classifications (company_id, product_key, created_at desc);

create table public.buyer_scores (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_key text not null,
  total_score smallint not null check (total_score between 0 and 100),
  score_version text not null,
  components jsonb not null,
  calculated_at timestamptz not null default now()
);
create index buyer_scores_rank_idx on public.buyer_scores (product_key, total_score desc);

create table public.search_queries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  product_key text not null,
  segment public.buyer_segment not null,
  location_text text not null,
  query_text text not null,
  radius_km integer check (radius_km > 0),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.search_jobs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status public.job_status not null default 'queued',
  requested_by uuid references auth.users(id) on delete set null,
  input jsonb not null,
  stats jsonb not null default '{}',
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.raw_search_results (
  id uuid primary key default gen_random_uuid(),
  search_job_id uuid not null references public.search_jobs(id) on delete cascade,
  search_query_id uuid references public.search_queries(id) on delete set null,
  source_type text not null,
  source_external_id text,
  payload jsonb not null,
  content_hash text not null,
  processing_status text not null default 'pending' check (processing_status in ('pending', 'merged', 'created', 'rejected', 'failed')),
  matched_company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (search_job_id, source_type, content_hash)
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text,
  role_title text,
  role_category text check (role_category in ('procurement', 'supply_chain', 'production', 'operations', 'management', 'owner', 'other')),
  corporate_email text,
  corporate_phone text,
  linkedin_url text,
  source_id uuid references public.sources(id) on delete set null,
  confidence numeric(4,3) check (confidence between 0 and 1),
  created_at timestamptz not null default now()
);

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org_id and m.user_id = auth.uid()
  );
$$;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.companies enable row level security;
alter table public.company_locations enable row level security;
alter table public.sources enable row level security;
alter table public.company_source_links enable row level security;
alter table public.company_evidence enable row level security;
alter table public.company_classifications enable row level security;
alter table public.buyer_scores enable row level security;
alter table public.search_queries enable row level security;
alter table public.search_jobs enable row level security;
alter table public.raw_search_results enable row level security;
alter table public.contacts enable row level security;

create policy "members can read organizations" on public.organizations for select using (public.is_org_member(id));
create policy "members can read memberships" on public.organization_members for select using (public.is_org_member(organization_id));
create policy "members manage companies" on public.companies for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members manage sources" on public.sources for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members manage search queries" on public.search_queries for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "members manage search jobs" on public.search_jobs for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "members manage company locations" on public.company_locations for all
using (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)))
with check (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)));
create policy "members manage source links" on public.company_source_links for all
using (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)))
with check (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)));
create policy "members manage evidence" on public.company_evidence for all
using (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)))
with check (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)));
create policy "members manage classifications" on public.company_classifications for all
using (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)))
with check (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)));
create policy "members manage buyer scores" on public.buyer_scores for all
using (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)))
with check (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)));
create policy "members manage raw results" on public.raw_search_results for all
using (exists (select 1 from public.search_jobs j where j.id = search_job_id and public.is_org_member(j.organization_id)))
with check (exists (select 1 from public.search_jobs j where j.id = search_job_id and public.is_org_member(j.organization_id)));
create policy "members manage contacts" on public.contacts for all
using (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)))
with check (exists (select 1 from public.companies c where c.id = company_id and public.is_org_member(c.organization_id)));

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();
