-- Workspace-aware inventory access.
-- Owners retain full access; editors may read/write; viewers may only read.
create or replace function private.can_read_workspace_inventory(p_owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select p_owner_id is not null
    and (
      p_owner_id = (select auth.uid())
      or exists (
        select 1
        from public.workspaces w
        join public.workspace_members wm on wm.workspace_id = w.id
        where w.owner_id = p_owner_id
          and wm.user_id = (select auth.uid())
      )
    );
$function$;

create or replace function private.can_edit_workspace_inventory(p_owner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select p_owner_id is not null
    and (
      p_owner_id = (select auth.uid())
      or exists (
        select 1
        from public.workspaces w
        join public.workspace_members wm on wm.workspace_id = w.id
        where w.owner_id = p_owner_id
          and wm.user_id = (select auth.uid())
          and wm.role = 'editor'
      )
    );
$function$;

revoke all on function private.can_read_workspace_inventory(uuid) from public, anon;
revoke all on function private.can_edit_workspace_inventory(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.can_read_workspace_inventory(uuid) to authenticated;
grant execute on function private.can_edit_workspace_inventory(uuid) to authenticated;

drop policy if exists "Workspace members can read products" on public.products;
create policy "Workspace members can read products"
on public.products for select to authenticated
using (private.can_read_workspace_inventory(owner_id));

drop policy if exists "Workspace editors can insert products" on public.products;
create policy "Workspace editors can insert products"
on public.products for insert to authenticated
with check (private.can_edit_workspace_inventory(owner_id));

drop policy if exists "Workspace editors can update products" on public.products;
create policy "Workspace editors can update products"
on public.products for update to authenticated
using (private.can_edit_workspace_inventory(owner_id))
with check (private.can_edit_workspace_inventory(owner_id));

drop policy if exists "Workspace editors can delete products" on public.products;
create policy "Workspace editors can delete products"
on public.products for delete to authenticated
using (private.can_edit_workspace_inventory(owner_id));

drop policy if exists "Workspace members can read inventory logs" on public.inventory_logs;
create policy "Workspace members can read inventory logs"
on public.inventory_logs for select to authenticated
using (private.can_read_workspace_inventory(owner_id));

drop policy if exists "Workspace editors can insert inventory logs" on public.inventory_logs;
create policy "Workspace editors can insert inventory logs"
on public.inventory_logs for insert to authenticated
with check (private.can_edit_workspace_inventory(owner_id));

drop policy if exists "Workspace editors can update inventory logs" on public.inventory_logs;
create policy "Workspace editors can update inventory logs"
on public.inventory_logs for update to authenticated
using (private.can_edit_workspace_inventory(owner_id))
with check (private.can_edit_workspace_inventory(owner_id));

drop policy if exists "Workspace editors can delete inventory logs" on public.inventory_logs;
create policy "Workspace editors can delete inventory logs"
on public.inventory_logs for delete to authenticated
using (private.can_edit_workspace_inventory(owner_id));
