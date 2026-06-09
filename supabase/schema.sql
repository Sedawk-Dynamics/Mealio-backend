-- ============================================================================
-- Mealio — registrations table
-- Run this in the Supabase SQL editor (Dashboard -> SQL Editor -> New query)
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.registrations (
  id                    uuid primary key default gen_random_uuid(),
  name                  text        not null,
  email                 text        not null,
  phone                 text        not null,
  address               text        not null,
  aadhaar_number        text        not null,
  aadhaar_document_url  text        not null,
  aadhaar_public_id     text,
  aadhaar_resource_type text        default 'image',
  created_at            timestamptz not null default now()
);

-- Helpful indexes for the admin search / ordering.
create index if not exists registrations_created_at_idx
  on public.registrations (created_at desc);

create index if not exists registrations_email_idx
  on public.registrations (lower(email));

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
-- We enable RLS but add NO public policies. All access goes through the
-- server-side service-role key (which bypasses RLS), so the table is never
-- readable/writable from the browser with the anon key.
alter table public.registrations enable row level security;
