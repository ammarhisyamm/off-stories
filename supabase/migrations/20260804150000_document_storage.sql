insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  5242880,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Workspace members can upload documents"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'documents'
  and public.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid())
);

create policy "Workspace members can read documents"
on storage.objects for select
to authenticated
using (
  bucket_id = 'documents'
  and public.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid())
);

create policy "Workspace members can update documents"
on storage.objects for update
to authenticated
using (
  bucket_id = 'documents'
  and public.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid())
)
with check (
  bucket_id = 'documents'
  and public.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid())
);

create policy "Workspace members can delete documents"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'documents'
  and public.is_workspace_member((storage.foldername(name))[1]::uuid, auth.uid())
);
