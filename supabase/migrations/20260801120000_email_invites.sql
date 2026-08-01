-- Email-based partner invites.
-- - workspace_invites gains an email column identifying the intended recipient.
-- - Only one active (un-revoked, un-accepted) invite per workspace.
-- - accept_workspace_invite validates that the signed-in user's email matches
--   the invite, and that the workspace doesn't already have a partner.
-- - remove_workspace_partner lets the owner remove a joined partner.

alter table public.workspace_invites
  add column if not exists email text;

create unique index one_active_invite_per_workspace
  on public.workspace_invites (workspace_id)
  where revoked_at is null and accepted_at is null;

create or replace function public.accept_workspace_invite(p_token uuid)
returns uuid
language plpgsql
security definer
set search_path = public as $$
declare
  inv public.workspace_invites%rowtype;
  u uuid := auth.uid();
  user_email text;
  inv_email text;
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

  -- The invite is addressed to a specific person: their email must match.
  if inv.email is not null then
    user_email := lower(coalesce(auth.jwt()->>'email', ''));
    inv_email := lower(btrim(inv.email));
    if user_email <> inv_email then
      raise exception 'This invitation is for a different email address';
    end if;
  end if;

  -- Only the owner's partner may join; reject if a partner already exists.
  if exists (
    select 1
    from public.workspace_members wm
    join public.workspaces w on w.id = wm.workspace_id
    where wm.workspace_id = inv.workspace_id
      and wm.user_id <> u
      and wm.user_id <> w.owner_id
  ) then
    raise exception 'This workspace already has a partner';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (inv.workspace_id, u, 'editor')
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

create or replace function public.remove_workspace_partner(p_workspace uuid, p_partner uuid)
returns void
language plpgsql
security definer
set search_path = public as $$
declare
  u uuid := auth.uid();
begin
  if u is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.workspaces where id = p_workspace and owner_id = u
  ) then
    raise exception 'Only the owner can remove a partner';
  end if;

  delete from public.workspace_members
  where workspace_id = p_workspace
    and user_id = p_partner
    and user_id <> u;

  -- Point the removed partner back to their own workspace if this was active.
  update public.profiles set active_workspace_id = null
  where id = p_partner and active_workspace_id = p_workspace;
end;
$$;

revoke execute on function public.accept_workspace_invite(uuid) from public, anon;
grant execute on function public.accept_workspace_invite(uuid) to authenticated;
grant execute on function public.remove_workspace_partner(uuid, uuid) to authenticated;
