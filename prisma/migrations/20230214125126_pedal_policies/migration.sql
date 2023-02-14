-- Create a policy to give allow authenticated users permissions
CREATE POLICY "Authenticated users can modify Pedals" ON "public"."Pedal"
AS PERMISSIVE FOR UPDATE
TO rls_user
USING (auth.jwt() ->> 'role' = 'authenticated')
WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

-- Prisma needs to select after an update
CREATE POLICY "Authenticated users can select Pedals" ON "public"."Pedal"
AS PERMISSIVE FOR SELECT
TO rls_user
USING (auth.jwt() ->> 'role' = 'authenticated');

