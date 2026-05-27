-- Run this in Supabase Dashboard → SQL Editor

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  country text,
  company text,
  client_type text,
  budget_k integer,
  project_details text,
  terms_accepted boolean not null default false
);

alter table if exists public.contact_inquiries add column if not exists country text;

alter table public.contact_inquiries enable row level security;

DROP POLICY IF EXISTS "Allow anonymous contact form inserts"
ON public.contact_inquiries;

CREATE POLICY "Allow anonymous contact form inserts"
ON public.contact_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
-- Admin dashboard (admin.html): signed-in users can read all inquiries
drop policy if exists "Allow authenticated read contact inquiries" on public.contact_inquiries;
create policy "Allow authenticated read contact inquiries"
  on public.contact_inquiries
  for select
  to authenticated
  using (true);

drop policy if exists "Allow authenticated delete contact inquiries" on public.contact_inquiries;
create policy "Allow authenticated delete contact inquiries"
  on public.contact_inquiries
  for delete
  to authenticated
  using (true);

-- Create admin user: Supabase Dashboard → Authentication → Users → Add user
-- Then sign in at /admin.html
