create or replace function public.get_my_workspace(p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_member public.workspace_members%rowtype;
  v_workspace public.workspaces%rowtype;
  v_members json;
begin
  if auth.uid() is null or p_user_id is distinct from auth.uid() then
    raise exception 'Not authorized';
  end if;

  -- Prefer a workspace shared with this account over one it owns. If the
  -- account has joined multiple shared workspaces, use the most recent join.
  select wm.* into v_member
  from public.workspace_members wm
  join public.workspaces candidate_workspace on candidate_workspace.id = wm.workspace_id
  where wm.user_id = auth.uid()
  order by
    (candidate_workspace.owner_id = auth.uid()) asc,
    wm.joined_at desc
  limit 1;

  if v_member.id is null then
    return json_build_object('member', false);
  end if;

  select w.* into v_workspace
  from public.workspaces w
  where w.id = v_member.workspace_id;

  select json_agg(json_build_object(
    'user_id', wm.user_id,
    'role', wm.role,
    'joined_at', wm.joined_at,
    'email', au.email
  )) into v_members
  from public.workspace_members wm
  join auth.users au on au.id = wm.user_id
  where wm.workspace_id = v_member.workspace_id;

  return json_build_object(
    'member', true,
    'workspace_id', v_member.workspace_id,
    'workspace_name', v_workspace.name,
    'owner_id', v_workspace.owner_id,
    'owner_email', (select owner_user.email from auth.users owner_user where owner_user.id = v_workspace.owner_id),
    'role', v_member.role,
    'members', v_members
  );
end;
$function$;
