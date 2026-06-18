
-- Enums
create type public.member_role as enum ('owner', 'editor', 'viewer');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  active_workspace_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Profiles readable by signed-in users" on public.profiles for select to authenticated using (true);
create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- Workspaces
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Wedding',
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.workspaces to authenticated;
grant all on public.workspaces to service_role;
alter table public.workspaces enable row level security;

-- Members
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'editor',
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
grant select, insert, update, delete on public.workspace_members to authenticated;
grant all on public.workspace_members to service_role;
alter table public.workspace_members enable row level security;

-- Security-definer helpers to avoid RLS recursion
create or replace function public.is_workspace_member(_workspace uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = _workspace and user_id = _user)
$$;

create or replace function public.is_workspace_owner(_workspace uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspaces where id = _workspace and owner_id = _user)
$$;

create policy "Members can view their workspaces" on public.workspaces for select to authenticated
  using (public.is_workspace_member(id, auth.uid()));
create policy "Owners can update their workspace" on public.workspaces for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Owners can delete their workspace" on public.workspaces for delete to authenticated
  using (owner_id = auth.uid());
create policy "Authenticated users can create workspaces" on public.workspaces for insert to authenticated
  with check (owner_id = auth.uid());

create policy "Members can view co-members" on public.workspace_members for select to authenticated
  using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "Owners manage members" on public.workspace_members for insert to authenticated
  with check (public.is_workspace_owner(workspace_id, auth.uid()));
create policy "Owners update member roles" on public.workspace_members for update to authenticated
  using (public.is_workspace_owner(workspace_id, auth.uid()));
create policy "Users may leave; owners may remove" on public.workspace_members for delete to authenticated
  using (user_id = auth.uid() or public.is_workspace_owner(workspace_id, auth.uid()));

-- Invites
create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  role public.member_role not null default 'editor',
  created_by uuid not null references auth.users(id),
  expires_at timestamptz,
  accepted_at timestamptz,
  accepted_by uuid references auth.users(id),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.workspace_invites to authenticated;
grant all on public.workspace_invites to service_role;
alter table public.workspace_invites enable row level security;

create policy "Owners manage invites" on public.workspace_invites for all to authenticated
  using (public.is_workspace_owner(workspace_id, auth.uid()))
  with check (public.is_workspace_owner(workspace_id, auth.uid()));
-- Allow any signed-in user to read a single invite row to accept it (token is the secret)
create policy "Signed-in users can read invites" on public.workspace_invites for select to authenticated using (true);

-- Calendar sync log
create table public.calendar_sync_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  milestone_key text not null,
  gcal_event_id text not null,
  title text,
  event_date date,
  synced_at timestamptz not null default now(),
  unique (user_id, milestone_key)
);
grant select, insert, update, delete on public.calendar_sync_log to authenticated;
grant all on public.calendar_sync_log to service_role;
alter table public.calendar_sync_log enable row level security;
create policy "Users manage their own sync log" on public.calendar_sync_log for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Auto-create profile + personal workspace on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_workspace_id uuid;
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.workspaces (name, owner_id)
  values (coalesce(new.raw_user_meta_data->>'full_name', 'My Wedding') || '''s Wedding', new.id)
  returning id into new_workspace_id;
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');
  update public.profiles set active_workspace_id = new_workspace_id where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger for profiles
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
