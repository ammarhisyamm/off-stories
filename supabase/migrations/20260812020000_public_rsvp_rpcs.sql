-- Public RSVP + check-in reads and writes without a service-role key on the server.
-- The token is the secret; functions are security definer so anon callers can operate
-- on rsvp_links / workspace_data without explicit grants.

create or replace function public.get_public_rsvp(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_guest_id text;
  v_revoked_at timestamptz;
  v_event jsonb;
  v_guests jsonb;
  v_guest jsonb;
begin
  select workspace_id, guest_id, revoked_at
    into v_workspace_id, v_guest_id, v_revoked_at
  from public.rsvp_links
  where token = p_token;

  if v_workspace_id is null or v_revoked_at is not null then
    return null;
  end if;

  select payload into v_event from public.workspace_data
  where workspace_id = v_workspace_id and kind = 'event';

  select payload into v_guests from public.workspace_data
  where workspace_id = v_workspace_id and kind = 'guests';

  select g into v_guest from jsonb_array_elements(coalesce(v_guests, '[]'::jsonb)) g
  where g ->> 'id' = v_guest_id;

  if v_guest is null then
    return null;
  end if;

  return jsonb_build_object(
    'event', jsonb_build_object(
      'name', v_event -> 'name',
      'date', v_event -> 'date',
      'location', v_event -> 'location'
    ),
    'guest', jsonb_build_object(
      'name', v_guest -> 'name',
      'pax', coalesce((v_guest -> 'pax')::int, 1),
      'rsvp', v_guest -> 'rsvp'
    )
  );
end;
$$;

create or replace function public.submit_public_rsvp(
  p_token uuid,
  p_rsvp text,
  p_pax int,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_guest_id text;
  v_revoked_at timestamptz;
  v_guests jsonb;
  v_guest jsonb;
  v_next jsonb;
begin
  select workspace_id, guest_id, revoked_at
    into v_workspace_id, v_guest_id, v_revoked_at
  from public.rsvp_links
  where token = p_token;

  if v_workspace_id is null or v_revoked_at is not null then
    return jsonb_build_object('ok', false, 'reason', 'inactive');
  end if;

  if p_rsvp not in ('yes', 'no', 'maybe') then
    return jsonb_build_object('ok', false, 'reason', 'invalid');
  end if;

  select payload into v_guests from public.workspace_data
  where workspace_id = v_workspace_id and kind = 'guests';
  v_guests := coalesce(v_guests, '[]'::jsonb);

  select g into v_guest from jsonb_array_elements(v_guests) g
  where g ->> 'id' = v_guest_id;

  if v_guest is null then
    return jsonb_build_object('ok', false, 'reason', 'missing');
  end if;

  select jsonb_agg(case when g ->> 'id' = v_guest_id then
      g || jsonb_build_object(
        'rsvp', p_rsvp,
        'pax', p_pax,
        'dietaryNotes', coalesce(p_note, g -> 'dietaryNotes')
      )
    else g end)
    into v_next
  from jsonb_array_elements(v_guests) g;

  insert into public.workspace_data (workspace_id, kind, payload, updated_at)
  values (v_workspace_id, 'guests', v_next, now())
  on conflict (workspace_id, kind)
  do update set payload = excluded.payload, updated_at = now();

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.submit_public_check_in(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_guest_id text;
  v_revoked_at timestamptz;
  v_guests jsonb;
  v_guest jsonb;
  v_next jsonb;
begin
  select workspace_id, guest_id, revoked_at
    into v_workspace_id, v_guest_id, v_revoked_at
  from public.rsvp_links
  where token = p_token;

  if v_workspace_id is null or v_revoked_at is not null then
    return jsonb_build_object('ok', false, 'reason', 'inactive');
  end if;

  select payload into v_guests from public.workspace_data
  where workspace_id = v_workspace_id and kind = 'guests';
  v_guests := coalesce(v_guests, '[]'::jsonb);

  select g into v_guest from jsonb_array_elements(v_guests) g
  where g ->> 'id' = v_guest_id;

  if v_guest is null then
    return jsonb_build_object('ok', false, 'reason', 'missing');
  end if;

  select jsonb_agg(case when g ->> 'id' = v_guest_id then
      g || jsonb_build_object('checkedIn', true)
    else g end)
    into v_next
  from jsonb_array_elements(v_guests) g;

  insert into public.workspace_data (workspace_id, kind, payload, updated_at)
  values (v_workspace_id, 'guests', v_next, now())
  on conflict (workspace_id, kind)
  do update set payload = excluded.payload, updated_at = now();

  return jsonb_build_object('ok', true, 'guestName', v_guest -> 'name');
end;
$$;

revoke execute on function public.get_public_rsvp(uuid) from public;
revoke execute on function public.submit_public_rsvp(uuid, text, int, text) from public;
revoke execute on function public.submit_public_check_in(uuid) from public;
grant execute on function public.get_public_rsvp(uuid) to anon, authenticated;
grant execute on function public.submit_public_rsvp(uuid, text, int, text) to anon, authenticated;
grant execute on function public.submit_public_check_in(uuid) to anon, authenticated;