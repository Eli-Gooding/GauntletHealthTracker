-- Add food_packed column to users table
ALTER TABLE public.users
ADD COLUMN food_packed boolean DEFAULT false;

-- Enable Row Level Security for the food_packed column
DROP POLICY IF EXISTS "Anyone can update food_packed status" ON public.users;
CREATE POLICY "Anyone can update food_packed status"
    ON public.users FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Add function to reset all food_packed values
CREATE OR REPLACE FUNCTION reset_food_packed()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.users 
    SET food_packed = false 
    WHERE health_status = 'sick' OR food_packed = true;
    RETURN;
END;
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION reset_food_packed() TO authenticated;

-- Add policy to allow updates to food_packed column
DROP POLICY IF EXISTS "Enable update for food_packed column" ON public.users;
CREATE POLICY "Enable update for food_packed column"
    ON public.users FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
