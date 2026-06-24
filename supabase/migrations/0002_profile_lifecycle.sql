alter table business_profiles
  add column status text not null default 'draft'
    check (status in ('draft', 'reviewed')),
  add column extraction_status text not null default 'pending'
    check (extraction_status in ('pending', 'succeeded', 'failed')),
  add column extraction_error text,
  add column extraction_attempts integer not null default 0
    check (extraction_attempts >= 0 and extraction_attempts <= 2),
  add column last_extraction_attempt_at timestamptz;
