alter policy "Users can view their own scorecard"
  on public.user_scorecards
  to authenticated
  using ((select auth.uid()) = user_id);

alter policy "Users can insert their own scorecard"
  on public.user_scorecards
  to authenticated
  with check ((select auth.uid()) = user_id);

alter policy "Users can update their own scorecard"
  on public.user_scorecards
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

alter policy "Users can delete their own scorecard"
  on public.user_scorecards
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_user_scorecards_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();

  if (select auth.role()) = 'authenticated' then
    if tg_op = 'INSERT' then
      new.profile = jsonb_set(coalesce(new.profile, '{}'::jsonb) - 'subscription', '{isPro}', 'false'::jsonb, true);
    elsif tg_op = 'UPDATE' then
      new.profile = jsonb_set(
        coalesce(new.profile, '{}'::jsonb),
        '{isPro}',
        coalesce(old.profile->'isPro', 'false'::jsonb),
        true
      );
      if old.profile ? 'subscription' then
        new.profile = jsonb_set(new.profile, '{subscription}', old.profile->'subscription', true);
      else
        new.profile = new.profile - 'subscription';
      end if;
    end if;
  end if;

  return new;
end;
$$;

create trigger trg_user_scorecards_before_insert
  before insert on public.user_scorecards
  for each row
  execute function public.set_user_scorecards_updated_at();
