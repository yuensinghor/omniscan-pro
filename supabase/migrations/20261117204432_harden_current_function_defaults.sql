-- Revoke default function execution grants for functions created by the
-- migration role. New public RPCs must receive explicit grants.
alter default privileges in schema public
  revoke execute on functions from anon, authenticated, service_role;

alter default privileges
  revoke execute on functions from public;
