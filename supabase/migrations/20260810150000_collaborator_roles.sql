-- Collaborator role management.
-- - add update_member_role so the owner can flip an invited collaborator
--   between viewer (read-only) and editor within a single-partner workspace.
-- - only ever allow viewer/editor here; the owner role is never assignable.

create or replace function public.update_member_role(
  p_workspace uuid,
  p_user uuid,
  p_role public.member_role
)
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

  if p_role not in ('viewer', 'editor') then
    raise exception 'Only viewer or editor roles can be assigned';
  end if;

  if p_user = u then
    raise exception 'You cannot change your own role';
  end if;

  if not exists (
    select 1 from public.workspaces where id = p_workspace and owner_id = u
  ) then
    raise exception 'Only the owner can change roles';
  end if;

  update public.workspace_members
  set role = p_role
  where workspace_id = p_workspace and user_id = p_user;

  if not found then
    raise exception 'Member not found';
  end if;
end;
$$;

revoke execute on function public.update_member_role(uuid, uuid, public.member_role) from public, anon;
grant execute on function public.update_member_role(uuid, uuid, public.member_role) to authenticated;

-- Make invite-acceptance honour the role carried by the invite (editor by
-- default). Email-less invites act as generic share links: anyone who opens
-- them while signed in can join with the configured role.
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

  -- Only the owner's partner may join; reject if a collaborator already exists.
  if exists (
    select 1
    from public.workspace_members wm
    join public.workspaces w on w.id = wm.workspace_id
    where wm.workspace_id = inv.workspace_id
      and wm.user_id <> u
      and wm.user_id <> w.owner_id
  ) then
    raise exception 'This workspace already has a collaborator';
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