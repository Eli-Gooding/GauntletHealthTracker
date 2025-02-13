-- Add notes columns to users table
ALTER TABLE public.users
ADD COLUMN lunch_note text,
ADD COLUMN dinner_note text,
ADD COLUMN other_note text,
ADD COLUMN lunch_note_updated_at timestamptz,
ADD COLUMN dinner_note_updated_at timestamptz,
ADD COLUMN other_note_updated_at timestamptz;

-- Update the users table policy to allow updating notes
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
