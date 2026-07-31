-- Accept an invite as the signed-in user. Security definer so it can validate
-- the token and insert the member row without tripping member RLS (the invitee
-- is not yet a member and not the owner).

create or replace function public.accept_workspace_invite(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public as $$
declare
  inv public.workspace_invites%rowtype;
  u uuid := auth.uid();
begin
  if u is null then
    raise exception 'Not authenticated';
  end if;

  select * into inv from public.workspace_invites where token = p_token;
  if not found then
    raise exception 'Invite not found';
  end if;
  if inv.revoked_at is not null then
    raise exception 'This invite was revoked';
  end if;
  if inv.expires_at is not null and inv.expires_at < now() then
    raise exception 'This invite has expired';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (inv.workspace_id, u, inv.role)
  on conflict (workspace_id, user_id)
  do update set role = excluded.role;

  if inv.accepted_at is null then
    update public.workspace_invites
    set accepted_at = now(), accepted_by = u
    where id = inv.id;
  end if;

  update public.profiles set active_workspace_id = inv.workspace_id where id = u;
  return inv.workspace_id;
end;
$$;

revoke execute on function public.accept_workspace_invite(uuid) from public, anon;
grant execute on function public.accept_workspace_invite(uuid) to authenticated;
