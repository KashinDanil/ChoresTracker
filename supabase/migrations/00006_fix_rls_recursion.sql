-- Helper function to get the current user's household IDs.
-- SECURITY DEFINER bypasses RLS, avoiding infinite recursion
-- when household_members policies reference household_members.
create or replace function public.get_user_household_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select household_id from public.household_members where user_id = auth.uid()
$$;

-- Fix household_members SELECT policy (was self-referencing → infinite recursion)
drop policy "Members can see household members" on public.household_members;
create policy "Members can see household members"
  on public.household_members for select
  to authenticated
  using (household_id in (select public.get_user_household_ids()));

-- Fix households SELECT policy (referenced household_members which triggered the recursive policy)
drop policy "Households visible to members" on public.households;
create policy "Households visible to members"
  on public.households for select
  to authenticated
  using (id in (select public.get_user_household_ids()));

-- Fix chores SELECT policy (same issue)
drop policy "Chores visible to household members" on public.chores;
create policy "Chores visible to household members"
  on public.chores for select
  to authenticated
  using (household_id in (select public.get_user_household_ids()));

-- Fix chores INSERT policy
drop policy "Household members can create chores" on public.chores;
create policy "Household members can create chores"
  on public.chores for insert
  to authenticated
  with check (
    household_id in (select public.get_user_household_ids())
    and auth.uid() = created_by
  );

-- Fix chores UPDATE policy
drop policy "Household members can update chores" on public.chores;
create policy "Household members can update chores"
  on public.chores for update
  to authenticated
  using (household_id in (select public.get_user_household_ids()));
