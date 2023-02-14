-- Create a policy to give allow authenticated users permissions
CREATE POLICY "Authenticated users can create Synths" ON "public"."Synthesizer"
AS PERMISSIVE
FOR INSERT
TO rls_user
WITH CHECK (auth.jwt() ->> 'role' = 'authenticated');

-- Prisma needs to select after an insert
CREATE POLICY "Authenticated users can select Synths" ON "public"."Synthesizer"
AS PERMISSIVE FOR SELECT
TO rls_user
USING (auth.jwt() ->> 'role' = 'authenticated');

