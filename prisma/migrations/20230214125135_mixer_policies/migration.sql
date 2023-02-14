-- Create a policy to give allow authenticated users permissions
CREATE POLICY "Authenticated users can delete Mixers" ON "public"."Mixer"
AS PERMISSIVE FOR DELETE
TO rls_user
USING (auth.jwt() ->> 'role' = 'authenticated');

-- Prisma needs to select after a delete
CREATE POLICY "Authenticated users can select Mixers" ON "public"."Mixer"
AS PERMISSIVE FOR SELECT
TO rls_user
USING (auth.jwt() ->> 'role' = 'authenticated');
