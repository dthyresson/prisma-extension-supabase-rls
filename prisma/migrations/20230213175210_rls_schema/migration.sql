-- Sets up RLS

-- Create a new user for Prisma to use when connecting with RLS
DO
$do$
BEGIN
    IF EXISTS (SELECT FROM pg_catalog.pg_roles
        WHERE  rolname = 'rls_user'
        ) THEN

        -- DROP ROLE IF EXISTS rls_user;
        -- CREATE USER rls_user WITH PASSWORD 'password';

    ELSE
        -- while create user is an alias for role, user add login access
        CREATE USER rls_user WITH PASSWORD 'password';
    END IF;
END
$do$;


GRANT USAGE ON SCHEMA public to rls_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public to rls_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO rls_user;


-- Replicate the auth.jwt() function from the Supabase schema
CREATE SCHEMA IF NOT EXISTS auth;
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;
