-- RLS infinite-recursion fix.
--
-- Symptom: every authenticated read that hits a policy using the
-- is_workspace_member / is_workspace_owner helpers fails with
--   "54001: stack depth limit exceeded"
-- The policy calls the helper, the helper queries workspace_members /
-- workspaces, and those tables' policies call the helper again. This only
-- recurses when the helper runs as SECURITY INVOKER. If the live database is
-- missing the SECURITY DEFINER on these helpers (e.g. the previous
-- private-schema migration was never applied), this migration heals it.
--
-- It is fully idempotent: safe whether 20260813010000 was applied or not.
-- It recreates the helpers in BOTH public and private schemas as
-- SECURITY DEFINER (so any policy reference resolves to a definer copy),
-- then recreates every affected policy against the private copies and drops
-- the public helpers.

create schema if not exists private;

-- 1. Private helpers (SECURITY DEFINER so their inner queries bypass RLS).
create or replace function private.is_workspace_member(_workspace uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = _workspace and user_id = _user)
$$;

create or replace function private.is_workspace_owner(_workspace uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspaces where id = _workspace and owner_id = _user)
$$;

-- 2. Heal the public copies too (idempotent): policies that still reference
--    `public.is_workspace_member` immediately stop recursing.
create or replace function public.is_workspace_member(_workspace uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = _workspace and user_id = _user)
$$;

create or replace function public.is_workspace_owner(_workspace uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspaces where id = _workspace and owner_id = _user)
$$;

revoke execute on function public.is_workspace_member(uuid, uuid) from public, anon;
revoke execute on function public.is_workspace_owner(uuid, uuid) from public, anon;
grant execute on function private.is_workspace_member(uuid, uuid) to authenticated;
grant execute on function private.is_workspace_owner(uuid, uuid) to authenticated;

-- 3. Drop every policy that referenced the (potentially non-definer) helpers
--    so we can recreate them against the private copies.
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

-- 4. Recreate every policy against the private helpers.
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

-- 5. Remove the public helpers now that no policy references them.
drop function public.is_workspace_member(uuid, uuid);
drop function public.is_workspace_owner(uuid, uuid);
