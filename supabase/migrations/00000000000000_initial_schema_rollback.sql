-- Drop views
drop view if exists public.dashboard_stats;

-- Drop triggers
drop trigger if exists handle_users_updated_at on public.users;

-- Drop functions
drop function if exists public.handle_updated_at();

-- Drop tables
drop table if exists public.infection_events;
drop table if exists public.users;

-- Drop extensions (optional, uncomment if needed)
-- drop extension if exists "uuid-ossp";
