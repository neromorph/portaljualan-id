alter table business_profiles
  add column if not exists status text not null default 'draft'
    check (status in ('draft', 'reviewed')),
  add column if not exists extraction_status text not null default 'pending'
    check (extraction_status in ('pending', 'succeeded', 'failed')),
  add column if not exists extraction_error text;
