create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  contact_email text,
  category text not null default 'General',
  description text not null,
  active_tab text,
  page_url text,
  user_agent text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

alter table public.bug_reports enable row level security;

create policy "Anyone can submit a bug report"
  on public.bug_reports
  for insert
  to anon, authenticated
  with check (char_length(trim(description)) >= 5);
