create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

alter table public.households enable row level security;
alter table public.household_members enable row level security;

-- Household visible to its members
create policy "Households visible to members"
  on public.households for select
  to authenticated
  using (
    id in (select household_id from public.household_members where user_id = auth.uid())
  );

-- Any authenticated user can create a household
create policy "Authenticated users can create households"
  on public.households for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Members can see other members of their household
create policy "Members can see household members"
  on public.household_members for select
  to authenticated
  using (
    household_id in (select household_id from public.household_members where user_id = auth.uid())
  );

-- Users can join households (insert themselves)
create policy "Users can join households"
  on public.household_members for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can leave households (delete their own membership)
create policy "Users can leave households"
  on public.household_members for delete
  to authenticated
  using (auth.uid() = user_id);
