drop policy if exists "Owners can insert shared items" on public.shared_items;
create policy "Owners can share their own products"
on public.shared_items for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.products p
    where p.owner_id = (select auth.uid())
      and p.barcode = shared_items.barcode
  )
);

drop policy if exists "Owners can update shared items" on public.shared_items;
create policy "Owners can update their own product shares"
on public.shared_items for update to authenticated
using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.products p
    where p.owner_id = (select auth.uid())
      and p.barcode = shared_items.barcode
  )
);

drop policy if exists members_delete_own on public.workspace_members;
create policy members_delete_own
on public.workspace_members for delete to authenticated
using (user_id = (select auth.uid()) and role <> 'owner');

drop policy if exists owners_delete_members on public.workspace_members;
create policy owners_delete_members
on public.workspace_members for delete to authenticated
using (
  user_id <> (select auth.uid())
  and workspace_id in (
    select w.id from public.workspaces w
    where w.owner_id = (select auth.uid())
  )
);
