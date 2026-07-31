-- Per-workspace app data stored as JSONB blobs keyed by kind.
-- Each member can read and write all kinds for workspaces they belong to.

create table public.workspace_data (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, kind)
);

grant select, insert, update, delete on public.workspace_data to authenticated;
grant all on public.workspace_data to service_role;
alter table public.workspace_data enable row level security;

create policy "Members can CRUD workspace data" on public.workspace_data for all to authenticated
  using (public.is_workspace_member(workspace_id, auth.uid()))
  with check (public.is_workspace_member(workspace_id, auth.uid()));
