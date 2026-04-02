create type public.chore_status as enum ('pending', 'awaiting_game', 'awaiting_result', 'assigned', 'done');
create type public.recurrence_interval as enum ('daily', 'weekly', 'biweekly', 'monthly');

create table public.chores (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz not null,
  status public.chore_status not null default 'pending',
  game_name text,
  created_by uuid not null references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  completed_at timestamptz,
  recurrence public.recurrence_interval,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.chores enable row level security;

-- Chores visible to household members
create policy "Chores visible to household members"
  on public.chores for select
  to authenticated
  using (
    household_id in (select household_id from public.household_members where user_id = auth.uid())
  );

-- Household members can create chores
create policy "Household members can create chores"
  on public.chores for insert
  to authenticated
  with check (
    household_id in (select household_id from public.household_members where user_id = auth.uid())
    and auth.uid() = created_by
  );

-- Household members can update chores (status changes, assignment)
create policy "Household members can update chores"
  on public.chores for update
  to authenticated
  using (
    household_id in (select household_id from public.household_members where user_id = auth.uid())
  );

-- Only the creator can delete a chore
create policy "Chore creators can delete chores"
  on public.chores for delete
  to authenticated
  using (auth.uid() = created_by);

-- Auto-update updated_at on row change
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger chores_updated_at
  before update on public.chores
  for each row execute function public.update_updated_at();
