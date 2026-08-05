create table public.rsvp_links (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  guest_id text not null,
  token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (workspace_id, guest_id)
);

grant select, insert, update, delete on public.rsvp_links to authenticated;
grant all on public.rsvp_links to service_role;
alter table public.rsvp_links enable row level security;

create policy "Members can manage RSVP links"
  on public.rsvp_links for all to authenticated
  using (public.is_workspace_member(workspace_id, auth.uid()))
  with check (public.is_workspace_member(workspace_id, auth.uid()));
