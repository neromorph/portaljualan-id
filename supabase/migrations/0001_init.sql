-- 0001_init.sql
-- Enable pgvector for embedding similarity search
create extension if not exists vector;

-- Profiles created by UMKM users
create table business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  business_name text,
  business_type text,
  location text,
  started_year int,
  products_or_services text,
  monthly_revenue_estimate text,
  employee_count int,
  sales_channels text[],
  business_needs text,
  growth_target text,
  main_challenges text,
  strengths text[],
  risks text[],
  evidence_summary text,
  raw_story text not null,
  extraction_json jsonb not null default '{}'::jsonb,
  readiness_score int,
  readiness_level text check (readiness_level in ('awal', 'berkembang', 'siap_kolaborasi')),
  readiness_breakdown jsonb not null default '{}'::jsonb,
  readiness_explanation text,
  improvement_suggestions text[],
  embedding_text text,
  embedding_model text,
  embedding vector(768),
  is_public boolean not null default false,
  public_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Seed data for Business Partners (no partner accounts in MVP)
create table business_partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  partner_type text not null,
  location text,
  served_business_categories text[],
  description text,
  suitable_needs text[],
  suitable_business_scale text,
  contact_label text,
  contact_url text,
  embedding_text text not null,
  embedding_model text,
  embedding vector(768),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Evidence photos (non-sensitive only)
create table business_evidence (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references business_profiles(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- Cached partner matches
create table partner_matches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references business_profiles(id) on delete cascade,
  partner_id uuid not null references business_partners(id) on delete cascade,
  rule_score numeric not null,
  vector_score numeric not null,
  final_score numeric not null,
  explanation text,
  created_at timestamptz not null default now(),
  unique (profile_id, partner_id)
);

-- Enable RLS
alter table business_profiles enable row level security;
alter table business_partners enable row level security;
alter table business_evidence enable row level security;
alter table partner_matches enable row level security;

-- Profiles: owner can do everything
create policy "profiles_own_rows" on business_profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Partners: anyone can read active ones (for matching)
create policy "partners_active_readable" on business_partners
  for select using (is_active = true);

-- Evidence: only via profile ownership
create policy "evidence_via_profile" on business_evidence
  for all using (
    exists (
      select 1 from business_profiles
      where business_profiles.id = business_evidence.profile_id
      and business_profiles.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from business_profiles
      where business_profiles.id = business_evidence.profile_id
      and business_profiles.user_id = auth.uid()
    )
  );

-- Matches: readable only via profile ownership
create policy "matches_via_profile" on partner_matches
  for select using (
    exists (
      select 1 from business_profiles
      where business_profiles.id = partner_matches.profile_id
      and business_profiles.user_id = auth.uid()
    )
  );

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger business_profiles_updated_at
  before update on business_profiles
  for each row execute function set_updated_at();

create trigger business_partners_updated_at
  before update on business_partners
  for each row execute function set_updated_at();
