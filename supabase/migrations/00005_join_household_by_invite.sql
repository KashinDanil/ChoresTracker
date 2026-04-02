-- Function to join a household by invite code.
-- This bypasses RLS since the user can't SELECT the household before joining.
create or replace function public.join_household_by_invite(code text)
returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_household_id uuid;
begin
  select id into v_household_id
  from public.households
  where invite_code = code;

  if v_household_id is null then
    raise exception 'No household found with that invite code.';
  end if;

  insert into public.household_members (household_id, user_id)
  values (v_household_id, auth.uid());

  return v_household_id;
end;
$$;
