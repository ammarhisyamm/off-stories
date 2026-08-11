-- Security advisor fixes (round 2).
-- 1. Move the RLS-only helper functions is_workspace_member / is_workspace_owner
--    out of the exposed `public` schema into a private schema so they can no
--    longer be called via /rest/v1/rpc/ (clears authenticated_security_definer_
--    function_executable). RLS policies may reference functions in any schema,
--    so access control is unchanged.
-- 2. update_member_role becomes SECURITY INVOKER: the owner already passes the
--    underlying RLS policies, so definer is not required here.
-- accept_workspace_invite intentionally stays SECURITY DEFINER: the invitee is
--    not yet a member, so inserting into workspace_members must bypass RLS.

create schema if not exists private;

create or replace function private.is_workspace_member(_workspace uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = _workspace and user_id = _user)
$$;

create or replace function private.is_workspace_owner(_workspace uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspaces where id = _workspace and owner_id = _user)
$$;

revoke execute on function private.is_workspace_member(uuid, uuid) from public;
revoke execute on function private.is_workspace_owner(uuid, uuid) from public;
grant execute on function private.is_workspace_member(uuid, uuid) to authenticated;
grant execute on function private.is_workspace_owner(uuid, uuid) to authenticated;

-- Drop policies that referenced the public helpers so we can recreate them
-- against the private copies, then remove the public functions.
drop policy if exists "Members can view their workspaces" on public.workspaces;
drop policy if exists "Members can view co-members" on public.workspace_members;
drop policy if exists "Owners manage members" on public.workspace_members;
drop policy if exists "Owners update member roles" on public.workspace_members;
drop policy if exists "Users may leave; owners may remove" on public.workspace_members;
drop policy if exists "Owners manage invites" on public.workspace_invites;
drop policy if exists "Members can CRUD workspace data" on public.workspace_data;
drop policy if exists "Members can manage RSVP links" on public.rsvp_links;
drop policy if exists "Members can manage their invitation page" on public.invitation_pages;
drop policy if exists "Workspace members can upload documents" on storage.objects;
drop policy if exists "Workspace members can read documents" on storage.objects;
drop policy if exists "Workspace members can update documents" on storage.objects;
drop policy if exists "Workspace members can delete documents" on storage.objects;

drop function public.is_workspace_member(uuid, uuid);
drop function public.is_workspace_owner(uuid, uuid);

-- Recreate every policy against the private helpers.
create policy "Members can view their workspaces" on public.workspaces for select to authenticated
  using (private.is_workspace_member(id, auth.uid()));

create policy "Members can view co-members" on public.workspace_members for select to authenticated
  using (private.is_workspace_member(workspace_id, auth.uid()));
create policy "Owners manage members" on public.workspace_members for insert to authenticated
  with check (private.is_workspace_owner(workspace_id, auth.uid()));
create policy "Owners update member roles" on public.workspace_members for update to authenticated
  using (private.is_workspace_owner(workspace_id, auth.uid()));
create policy "Users may leave; owners may remove" on public.workspace_members for delete to authenticated
  using (user_id = auth.uid() or private.is_workspace_owner(workspace_id, auth.uid()));

create policy "Owners manage invites" on public.workspace_invites for all to authenticated
  using (private.is_workspace_owner(workspace_id, auth.uid()))
  with check (private.is_workspace_owner(workspace_id, auth.uid()));

create policy "Members can CRUD workspace data" on public.workspace_data for all to authenticated
  using (private.is_workspace_member(workspace_id, auth.uid()))
  with check (private.is_workspace_member(workspace_id, auth.uid()));

create policy "Members can manage RSVP links" on public.rsvp_links for all to authenticated
  using (private.is_workspace_member(workspace_id, auth.uid()))
  with check (private.is_workspace_member(workspace_id, auth.uid()));

create policy "Members can manage their invitation page" on public.invitation_pages for all to authenticated
  using (private.is_workspace_member(workspace_id, auth.uid()))
  with check (private.is_workspace_member(workspace_id, auth.uid()));

create policy "Workspace members can upload documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents'
  and private.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid())
);

create policy "Workspace members can read documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents'
  and private.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid())
);

create policy "Workspace members can update documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'documents'
  and private.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid())
)
with check (
  bucket_id = 'documents'
  and private.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid())
);

create policy "Workspace members can delete documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'documents'
  and private.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid())
);

-- 2. update_member_role as SECURITY INVOKER.
create or replace function public.update_member_role(
  p_workspace uuid,
  p_user uuid,
  p_role public.member_role
)
returns void
language plpgsql
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