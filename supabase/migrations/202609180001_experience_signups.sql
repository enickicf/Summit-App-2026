-- Attendee sign-ups for optional experiences (sauna, pickleball, wellness, pet therapy, rides,
-- tennis, high tea, poker). Names are staff-only headcount data and never part of a published
-- snapshot. Writes go through the server (service role) only; anonymous and authenticated
-- clients have no insert/update/delete policy. Staff may read through RLS like other
-- operational tables.

create table if not exists public.experience_signups (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events(id) on delete cascade,
  schedule_item_id uuid not null,
  install_id uuid not null,
  attendee_name text not null check (char_length(attendee_name) between 2 and 80),
  status text not null default 'confirmed' check (status in ('confirmed', 'waitlisted', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (schedule_item_id, install_id)
);

create index if not exists experience_signups_event_item_idx
  on public.experience_signups (event_id, schedule_item_id);
create index if not exists experience_signups_event_install_idx
  on public.experience_signups (event_id, install_id);

alter table public.experience_signups enable row level security;

drop policy if exists "staff can read experience signups" on public.experience_signups;
create policy "staff can read experience signups"
  on public.experience_signups for select
  using (public.current_staff_has_role(array['VIEWER', 'EDITOR', 'PUBLISHER', 'ADMIN']));

revoke all on table public.experience_signups from anon;
revoke insert, update, delete, truncate on table public.experience_signups from authenticated;

-- Attendee join/leave. Joining an existing row keeps a staff-assigned waitlist status and only
-- re-activates a cancelled row; leaving cancels the row (never deletes it).
create or replace function public.upsert_experience_signup(
  p_event_id text,
  p_schedule_item_id uuid,
  p_install_id uuid,
  p_attendee_name text,
  p_action text
)
returns public.experience_signups
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.experience_signups;
begin
  if p_action = 'join' then
    insert into public.experience_signups (event_id, schedule_item_id, install_id, attendee_name)
    values (p_event_id, p_schedule_item_id, p_install_id, trim(p_attendee_name))
    on conflict (schedule_item_id, install_id) do update
      set attendee_name = excluded.attendee_name,
          status = case when public.experience_signups.status = 'cancelled' then 'confirmed' else public.experience_signups.status end,
          updated_at = now()
      where public.experience_signups.event_id = excluded.event_id
    returning * into result;
  elsif p_action = 'leave' then
    update public.experience_signups
      set status = 'cancelled',
          updated_at = case when status = 'cancelled' then updated_at else now() end
      where event_id = p_event_id
        and schedule_item_id = p_schedule_item_id
        and install_id = p_install_id
    returning * into result;
  else
    raise exception 'INVALID_SIGNUP_ACTION';
  end if;

  return result;
end;
$$;

-- Staff waitlist control. Audited in the same transaction. Attendee-cancelled rows are not
-- resurrected by staff.
create or replace function public.set_experience_signup_status(
  p_event_id text,
  p_signup_id uuid,
  p_status text,
  p_actor_id uuid,
  p_actor_role text
)
returns public.experience_signups
language plpgsql
security definer
set search_path = public
as $$
declare
  previous_status text;
  result public.experience_signups;
begin
  if p_status not in ('confirmed', 'waitlisted') then
    raise exception 'INVALID_SIGNUP_STATUS';
  end if;
  if p_actor_role not in ('PUBLISHER', 'ADMIN') then
    raise exception 'SIGNUP_STATUS_FORBIDDEN';
  end if;

  select status into previous_status
  from public.experience_signups
  where id = p_signup_id and event_id = p_event_id
  for update;

  if previous_status is null then
    raise exception 'SIGNUP_NOT_FOUND';
  end if;
  if previous_status = 'cancelled' then
    raise exception 'SIGNUP_CANCELLED';
  end if;

  update public.experience_signups
    set status = p_status,
        updated_at = now()
    where id = p_signup_id
  returning * into result;

  insert into public.production_audit_entries (
    event_id, actor_id, actor_role, source, action, previous_value, new_value
  ) values (
    p_event_id,
    p_actor_id,
    p_actor_role,
    'MANUAL_EDITOR',
    'SET_EXPERIENCE_SIGNUP_STATUS',
    jsonb_build_object('signupId', p_signup_id, 'status', previous_status),
    jsonb_build_object('signupId', p_signup_id, 'scheduleItemId', result.schedule_item_id, 'status', p_status)
  );

  return result;
end;
$$;

revoke all on function public.upsert_experience_signup(text, uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function public.upsert_experience_signup(text, uuid, uuid, text, text) to service_role;
revoke all on function public.set_experience_signup_status(text, uuid, text, uuid, text) from public, anon, authenticated;
grant execute on function public.set_experience_signup_status(text, uuid, text, uuid, text) to service_role;
