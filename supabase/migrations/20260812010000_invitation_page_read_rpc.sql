-- Public read for the undangan page without exposing a service-role key on the server.
-- Security definer so it reads invitation_pages + the event payload while staying
-- unauthenticated; the token itself is the secret.
create or replace function public.get_invitation_page(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_workspace_id uuid;
  v_revoked_at timestamptz;
  v_event jsonb;
  v_workspace text;
begin
  select workspace_id, revoked_at into v_workspace_id, v_revoked_at
  from public.invitation_pages
  where token = p_token;
  if v_workspace_id is null then
    return null;
  end if;
  if v_revoked_at is not null then
    return '{"revoked":true}'::jsonb;
  end if;
  select name into v_workspace from public.workspaces where id = v_workspace_id;
  select payload into v_event from public.workspace_data
  where workspace_id = v_workspace_id and kind = 'event';
  return jsonb_build_object(
    'workspaceName', v_workspace,
    'event', coalesce(v_event, '{}'::jsonb)
  );
end;
$$;

revoke execute on function public.get_invitation_page(uuid) from public;
grant execute on function public.get_invitation_page(uuid) to anon, authenticated;