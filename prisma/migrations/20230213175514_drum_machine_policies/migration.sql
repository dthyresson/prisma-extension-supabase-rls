-- Create a policy to give allow authenticated users permissions
CREATE POLICY "Authenticated users can select Drum Machines" ON "public"."DrumMachine"
AS PERMISSIVE FOR SELECT
TO rls_user
USING (auth.jwt() ->> 'role' = 'authenticated');
