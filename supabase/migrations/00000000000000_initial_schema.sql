-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Create users table
create table if not exists public.users (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    full_name text not null,
    room_number text not null,
    health_status text not null default 'healthy' check (health_status in ('healthy', 'sick')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create infection_events table
create table if not exists public.infection_events (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    status text not null check (status in ('healthy', 'sick')),
    event_timestamp timestamptz not null default now()
);

-- Create indexes for better query performance
create index if not exists users_health_status_idx on public.users(health_status);
create index if not exists infection_events_user_id_idx on public.infection_events(user_id);
create index if not exists infection_events_timestamp_idx on public.infection_events(event_timestamp);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger to automatically update updated_at
create trigger handle_users_updated_at
    before update on public.users
    for each row
    execute function public.handle_updated_at();

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.infection_events enable row level security;

-- Create policies for users table
create policy "Users can view all profiles"
    on public.users for select
    to authenticated
    using (true);

create policy "Users can update their own profile"
    on public.users for update
    to authenticated
    using (auth.uid() = id);

-- Create policies for infection_events table
create policy "Users can view all infection events"
    on public.infection_events for select
    to authenticated
    using (true);

create policy "Users can create their own infection events"
    on public.infection_events for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Create view for dashboard statistics
create or replace view public.dashboard_stats as
select
    (select count(*) from public.users where health_status = 'sick') as currently_infected,
    (select count(*) 
     from public.users u
     where exists (
         select 1 
         from public.infection_events ie 
         where ie.user_id = u.id
     ) and u.health_status = 'healthy') as recovered,
    (select count(*) 
     from public.users u
     where not exists (
         select 1 
         from public.infection_events ie 
         where ie.user_id = u.id
     )) as never_infected;
