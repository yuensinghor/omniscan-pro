create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.api_rate_limits (
  subject_id uuid not null,
  bucket text not null,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 1),
  primary key (subject_id, bucket)
);
alter table private.api_rate_limits enable row level security;
revoke all on table private.api_rate_limits from public, anon, authenticated, service_role;

create or replace function public.consume_edge_rate_limit(
  p_subject_id uuid,
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_count integer;
begin
  if p_subject_id is null
     or p_bucket not in ('swift-action-user', 'swift-action-device', 'send-invite')
     or p_limit < 1
     or p_window_seconds < 1 then
    raise exception 'Invalid rate-limit request';
  end if;

  insert into private.api_rate_limits as limits
    (subject_id, bucket, window_started_at, request_count)
  values (p_subject_id, p_bucket, v_now, 1)
  on conflict (subject_id, bucket) do update
  set window_started_at = case
        when limits.window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        then v_now else limits.window_started_at end,
      request_count = case
        when limits.window_started_at <= v_now - pg_catalog.make_interval(secs => p_window_seconds)
        then 1 else limits.request_count + 1 end
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$function$;

revoke all on function public.consume_edge_rate_limit(uuid, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_edge_rate_limit(uuid, text, integer, integer)
  to service_role;
