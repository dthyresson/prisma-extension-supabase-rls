-- Sets up RLS

-- Create a new user for Prisma to use when connecting with RLS
DROP USER prisma_anon;
CREATE USER prisma_anon WITH PASSWORD 'password';
GRANT USAGE ON SCHEMA public to prisma_anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma_anon;

-- Enable RLS on the Car table
ALTER TABLE "public"."Car" ENABLE ROW LEVEL SECURITY;

-- Replicate the auth.role() function from the Supabase schema
CREATE SCHEMA IF NOT EXISTS auth;

CREATE OR REPLACE FUNCTION auth.role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$function$;

-- Create a policy to allow authenticated users to read cars
CREATE POLICY "get cars" ON "public"."Car"
AS PERMISSIVE FOR SELECT
TO prisma_anon
USING (auth.role() = 'authenticated');
