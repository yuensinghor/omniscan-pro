-- Restrict workspace RPCs and invite creation to the authenticated caller.
-- Existing app RPC signatures are preserved; supplied user IDs are checked
-- against auth.uid() to avoid breaking current client calls.

begin;

-- A caller must own the workspace before creating or changing its invites.
drop policy if exists "Owners can insert invites" on public.workspace_invites;
create policy "Workspace owners can insert invites"
on public.workspace_invites
for insert
to authenticated
with check (
  invited_by = (select auth.uid())
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = (select auth.uid())
  )
);

drop policy if exists "Owners can update invites" on public.workspace_invites;
create policy "Workspace owners can update invites"
on public.workspace_invites
for update
to authenticated
using (
  invited_by = (select auth.uid())
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = (select auth.uid())
  )
)
with check (
  invited_by = (select auth.uid())
  and exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_id = (select auth.uid())
  )
);

-- Membership creation must happen through a validated owner or invite flow.
drop policy if exists "owners_insert_members" on public.workspace_members;

-- Feedback comes from the signed-in app; remove the anonymous insert policy.
drop policy if exists "Anyone can insert feedback" on public.feedback;

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

  select wm.* into v_member
  from public.workspace_members wm
  where wm.user_id = auth.uid()
  order by wm.joined_at asc
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

create or replace function public.ensure_user_workspace(
  p_user_id uuid,
  p_name text default 'My Workspace'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_workspace_id uuid;
begin
  if auth.uid() is null or p_user_id is distinct from auth.uid() then
    raise exception 'Not authorized';
  end if;

  select w.id into v_workspace_id
  from public.workspaces w
  where w.owner_id = auth.uid()
  limit 1;

  if v_workspace_id is null then
    insert into public.workspaces (name, owner_id)
    values (coalesce(p_name, 'My Workspace'), auth.uid())
    returning id into v_workspace_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (v_workspace_id, auth.uid(), 'owner');
  end if;

  return v_workspace_id;
end;
$function$;

create or replace function public.generate_join_code()
returns text
language sql
volatile
set search_path = ''
as $function$
  select upper(encode(extensions.gen_random_bytes(6), 'hex'));
$function$;

create or replace function public.create_workspace_invite(
  p_workspace_id uuid,
  p_invited_by uuid,
  p_role text,
  p_email text
)
returns table(id uuid, join_code text, token text)
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_invite_id uuid;
  v_join_code text;
  v_token text;
  v_user_id uuid;
begin
  if auth.uid() is null
     or p_invited_by is distinct from auth.uid()
     or not exists (
       select 1 from public.workspaces w
       where w.id = p_workspace_id and w.owner_id = auth.uid()
     ) then
    raise exception 'Not authorized';
  end if;

  if p_role not in ('viewer', 'editor') then
    raise exception 'Invalid role';
  end if;

  v_join_code := public.generate_join_code();
  v_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.workspace_invites
    (workspace_id, invited_by, role, invited_email, join_code, token, expires_at)
  values
    (p_workspace_id, auth.uid(), p_role, p_email, v_join_code, v_token, now() + interval '7 days')
  returning workspace_invites.id into v_invite_id;

  select au.id into v_user_id
  from auth.users au
  where lower(au.email) = lower(p_email)
  limit 1;

  if v_user_id is not null then
    insert into public.workspace_members (workspace_id, user_id, role)
    select p_workspace_id, v_user_id, p_role
    where not exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = p_workspace_id and wm.user_id = v_user_id
    );
  end if;

  return query select v_invite_id, v_join_code, v_token;
end;
$function$;

create or replace function public.accept_invite_by_code(p_code text, p_user_id uuid)
returns json
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_invite public.workspace_invites%rowtype;
  v_workspace public.workspaces%rowtype;
begin
  if auth.uid() is null or p_user_id is distinct from auth.uid() then
    raise exception 'Not authorized';
  end if;

  select wi.* into v_invite
  from public.workspace_invites wi
  where wi.join_code = upper(p_code)
    and wi.expires_at > now()
    and wi.accepted = false
  limit 1;

  if v_invite.id is null then
    return json_build_object('success', false, 'error', 'Invalid or expired code');
  end if;

  if v_invite.invited_email is not null
     and lower(v_invite.invited_email) <> lower(coalesce(auth.jwt() ->> 'email', '')) then
    return json_build_object('success', false, 'error', 'This invite belongs to another email address');
  end if;

  if exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = v_invite.workspace_id and wm.user_id = auth.uid()
  ) then
    return json_build_object('success', false, 'error', 'Already a member of this workspace');
  end if;

  select w.* into v_workspace
  from public.workspaces w
  where w.id = v_invite.workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_invite.workspace_id, auth.uid(), v_invite.role);

  update public.workspace_invites
  set accepted = true
  where id = v_invite.id;

  return json_build_object(
    'success', true,
    'workspace_id', v_invite.workspace_id,
    'workspace_name', v_workspace.name,
    'role', v_invite.role,
    'owner_id', v_workspace.owner_id
  );
end;
$function$;

create or replace function public.accept_invite_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_invite public.workspace_invites%rowtype;
  v_workspace public.workspaces%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in to accept this invite';
  end if;

  select wi.* into v_invite
  from public.workspace_invites wi
  where wi.token = p_token
    and wi.accepted = false
    and wi.expires_at > now();

  if not found then
    return jsonb_build_object('error', 'Invalid or expired invite link');
  end if;

  if v_invite.invited_email is not null
     and lower(v_invite.invited_email) <> lower(coalesce(auth.jwt() ->> 'email', '')) then
    return jsonb_build_object('error', 'This invite belongs to another email address');
  end if;

  select w.* into v_workspace
  from public.workspaces w
  where w.id = v_invite.workspace_id;

  if v_workspace.id is null or v_workspace.owner_id = auth.uid() then
    return jsonb_build_object('error', 'You cannot join this workspace');
  end if;

  if exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = v_invite.workspace_id and wm.user_id = auth.uid()
  ) then
    return jsonb_build_object('error', 'Already a member of this workspace');
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_invite.workspace_id, auth.uid(), v_invite.role);

  update public.workspace_invites
  set accepted = true
  where id = v_invite.id;

  return jsonb_build_object(
    'success', true,
    'workspace_id', v_invite.workspace_id,
    'owner_id', v_workspace.owner_id,
    'role', v_invite.role
  );
end;
$function$;

create or replace function public.remove_workspace_member(
  p_workspace_id uuid,
  p_user_id uuid,
  p_owner_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null
     or p_owner_id is distinct from auth.uid()
     or not exists (
       select 1 from public.workspaces w
       where w.id = p_workspace_id and w.owner_id = auth.uid()
     ) then
    raise exception 'Not authorized';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Cannot remove yourself as owner';
  end if;

  delete from public.workspace_members
  where workspace_id = p_workspace_id and user_id = p_user_id;
end;
$function$;

create or replace function public.update_member_role(
  p_workspace_id uuid,
  p_user_id uuid,
  p_role text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if auth.uid() is null or not exists (
    select 1 from public.workspaces w
    where w.id = p_workspace_id and w.owner_id = auth.uid()
  ) then
    return jsonb_build_object('error', 'Not authorized');
  end if;

  if p_role not in ('viewer', 'editor') then
    return jsonb_build_object('error', 'Invalid role');
  end if;

  update public.workspace_members
  set role = p_role
  where workspace_id = p_workspace_id
    and user_id = p_user_id
    and user_id <> auth.uid();

  if not found then
    return jsonb_build_object('error', 'Member not found');
  end if;

  return jsonb_build_object('success', true, 'role', p_role);
end;
$function$;

-- Remove inherited/default PUBLIC plus explicit anon/authenticated grants,
-- then restore only the RPCs this app is allowed to call as a signed-in user.
revoke execute on all functions in schema public from public, anon, authenticated;

grant execute on function public.get_my_workspace(uuid) to authenticated;
grant execute on function public.ensure_user_workspace(uuid, text) to authenticated;
grant execute on function public.create_workspace_invite(uuid, uuid, text, text) to authenticated;
grant execute on function public.accept_invite_by_code(text, uuid) to authenticated;
grant execute on function public.accept_invite_by_token(text) to authenticated;
grant execute on function public.remove_workspace_member(uuid, uuid, uuid) to authenticated;
grant execute on function public.update_member_role(uuid, uuid, text) to authenticated;

-- Prevent functions created later by postgres in public from inheriting broad
-- Data API access. New RPCs must receive an explicit grant below.
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated, service_role;

-- PUBLIC execute is a separate global default and must be revoked separately.
alter default privileges for role postgres
  revoke execute on functions from public;

commit;
