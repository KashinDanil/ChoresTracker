-- Creates a household and adds the creator as the first member in one step.
-- Bypasses RLS since the creator can't SELECT the household before being a member.
create or replace function public.create_household(household_name text)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_household_id uuid;
begin
  insert into public.households (name, created_by)
  values (household_name, auth.uid())
  returning id into v_household_id;

  insert into public.household_members (household_id, user_id)
  values (v_household_id, auth.uid());

  return v_household_id;
end;
$$;
