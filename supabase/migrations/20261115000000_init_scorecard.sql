-- ISD Scoreboard: User Profile & Dossier Cloud Sync
-- Stores non-binary scorecard metadata (points, periods, notes, preferences) per authenticated user.
-- Raw PDF files stay 100% client-side in browser memory for applicant privacy.

create table if not exists public.user_scorecards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  dossier_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_scorecards enable row level security;

create policy "Users can view their own scorecard"
  on public.user_scorecards
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scorecard"
  on public.user_scorecards
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own scorecard"
  on public.user_scorecards
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own scorecard"
  on public.user_scorecards
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_user_scorecards_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_scorecards_updated_at on public.user_scorecards;
create trigger trg_user_scorecards_updated_at
  before update on public.user_scorecards
  for each row
  execute function public.set_user_scorecards_updated_at();
