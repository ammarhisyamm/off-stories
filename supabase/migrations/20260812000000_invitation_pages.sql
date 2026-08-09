-- Public wedding invitation page (undangan).
-- One optional shareable link per workspace. The token itself is the secret.
create table public.invitation_pages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (workspace_id)
);

grant select, insert, update, delete on public.invitation_pages to authenticated;
grant all on public.invitation_pages to service_role;
alter table public.invitation_pages enable row level security;

create policy "Members can manage their invitation page"
  on public.invitation_pages for all to authenticated
  using (public.is_workspace_member(workspace_id, auth.uid()))
  with check (public.is_workspace_member(workspace_id, auth.uid()));