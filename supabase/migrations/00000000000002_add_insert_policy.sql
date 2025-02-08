-- Add policy to allow users to insert their own profile
create policy "Users can insert their own profile"
    on public.users for insert
    to authenticated
    with check (auth.uid() = id);

-- Also add policy to allow users to sign up (this is needed for the initial profile creation)
create policy "Enable insert for authentication"
    on public.users for insert
    with check (true);
