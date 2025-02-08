-- Seed data for development environment
-- Note: In production, you would not want to insert users directly like this
-- as user authentication should be handled through Supabase Auth

-- Insert sample users
INSERT INTO public.users (id, email, full_name, room_number, health_status, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'john.doe@example.com', 'John Doe', '101', 'healthy', now() - interval '30 days', now()),
    ('22222222-2222-2222-2222-222222222222', 'jane.smith@example.com', 'Jane Smith', '102', 'sick', now() - interval '25 days', now()),
    ('33333333-3333-3333-3333-333333333333', 'bob.wilson@example.com', 'Bob Wilson', '103', 'healthy', now() - interval '20 days', now()),
    ('44444444-4444-4444-4444-444444444444', 'alice.jones@example.com', 'Alice Jones', '104', 'sick', now() - interval '15 days', now()),
    ('55555555-5555-5555-5555-555555555555', 'charlie.brown@example.com', 'Charlie Brown', '105', 'healthy', now() - interval '10 days', now());

-- Insert sample infection events
INSERT INTO public.infection_events (user_id, status, event_timestamp)
VALUES
    -- Jane Smith's infection history
    ('22222222-2222-2222-2222-222222222222', 'sick', now() - interval '20 days'),
    
    -- Bob Wilson's infection and recovery history
    ('33333333-3333-3333-3333-333333333333', 'sick', now() - interval '15 days'),
    ('33333333-3333-3333-3333-333333333333', 'healthy', now() - interval '8 days'),
    
    -- Alice Jones's infection history
    ('44444444-4444-4444-4444-444444444444', 'sick', now() - interval '5 days'),
    
    -- Charlie Brown's infection and recovery history
    ('55555555-5555-5555-5555-555555555555', 'sick', now() - interval '30 days'),
    ('55555555-5555-5555-5555-555555555555', 'healthy', now() - interval '23 days');

-- Create a rollback function for this seed data
CREATE OR REPLACE FUNCTION public.rollback_seed_data() RETURNS void AS $$
BEGIN
    DELETE FROM public.infection_events WHERE user_id IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555'
    );
    
    DELETE FROM public.users WHERE id IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444',
        '55555555-5555-5555-5555-555555555555'
    );
END;
$$ LANGUAGE plpgsql;
