-- Let signed-in members receive their own role updates through RLS-filtered Realtime.
alter publication supabase_realtime add table public.workspace_members;
