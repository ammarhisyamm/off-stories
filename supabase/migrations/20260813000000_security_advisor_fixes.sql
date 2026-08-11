-- Security advisor fixes.
-- 1. Guarantee every function in public/storage has an explicit search_path.
--    The security advisor warns on functions whose search_path is mutable.
--    This is idempotent: it only alters functions that still lack the setting,
--    and it is safe even when the same function was already fixed earlier.

do $$
declare
  r record;
begin
  for r in
    select n.nspname as sch,
           p.proname as fn,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public', 'storage')
      and p.prokind = 'f'
      and not exists (
        select 1 from pg_proc p2
        where p2.oid = p.oid
          and array_to_string(coalesce(p2.proconfig, '{}'), ',') like '%search_path%'
      )
  loop
    execute format('alter function %I.%I(%s) set search_path = public', r.sch, r.fn, r.args);
  end loop;
end $$;

-- 2. Restrict execute to the roles that actually need it.
revoke execute on function public.is_workspace_member(uuid, uuid) from public, anon;
revoke execute on function public.is_workspace_owner(uuid, uuid) from public, anon;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.accept_workspace_invite(uuid) from public;
revoke execute on function public.remove_workspace_partner(uuid, uuid) from public;
revoke execute on function public.update_member_role(uuid, uuid, public.member_role) from public;