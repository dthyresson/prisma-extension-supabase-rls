# useSupabaseRowLevelSecurity

`useSupabaseRowLevelSecurity` is a Prisma Client Extension supports [Supabase](https://supabase.com/docs) [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security#authrole) and policies written to use [Supabase's authentication system](https://supabase.com/docs/guides/auth/overview).

Using Postgres's "Row-Level-Security" policies, you can set rules on what data the anon key is allowed or not allowed to access by default.

Policies are PostgreSQL's rule engine. They are incredibly powerful and flexible, allowing you to [write complex SQL rules](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) which fit your unique business needs.

## Use

### Prisma Client with Supabase RLS Enforced

```ts
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.RLS_DATABASE_URL } },
}).$extends(useSupabaseRowLevelSecurity())
```

### Prisma Client with Supabase RLS Enforced and Claims Function

```ts
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.RLS_DATABASE_URL } },
}).$extends(
  useSupabaseRowLevelSecurity({
    claimsFn: () => ({
      aud: 'authenticated',
      sub: '1',
      role: 'authenticated',
    }),
  })
)
```
### Prisma Client with Supabase RLS Enforced with Claims from Context and Custom Error

```ts
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.RLS_DATABASE_URL } },
}).$extends(
  useSupabaseRowLevelSecurity({  
  /**
   * Return the decoded current user from the context
   */
  claimsFn: () => context.currentUser,
  /**
   * Throw a RedwoodJS ForbiddenError if the policy is violated
   */
  policyError: new ForbiddenError('Violates RLS.'),
  })
)
```

## Setup

1. Create Postgres Database
1. yarn install
1. Setup .env with database connections
1. yarn prisma:migrate

See [prisma/migrations/20230208161945_rls/migration.sql](prisma/migrations/20230208161945_rls/migration.sql)
## Testing

1. yarn test

## Helpful SQL Tips

### When Creating New Users

Wth Prisma, the role needs to be able to login. Therefore you should create the role with the `CREATE USER` command or be sure to grant them login permission if using `CREATE ROLE`:

```sql
-- while create user is an alias for role, user add login access
CREATE USER rls_user WITH PASSWORD 'password';
```

With a new user, they still need certain permissions to be able to access the database:

```sql
-- need usage of the public schema
GRANT USAGE ON SCHEMA public to rls_user;
-- need access to sequences for creates
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public to rls_user;
-- need access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO rls_user;
```

You will then enable RLS on all tables:

```sql
-- Enable RLS on all table
ALTER TABLE "public"."DrumMachine" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Mixer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Pedal" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Synthesizer" ENABLE ROW LEVEL SECURITY;
```

And then add policies for SELECT, UPDATE, INSERT, DELETE as needed.

```sql
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
```

Note that for Prisma, UPDATES, INSERTS and DELETES will need SELECT permission as well to behave as expected.

### View ALl Policies

```sql
SELECT rolname, * FROM pg_roles;
```

## Contributing

Feel free to open issues and pull requests. We're always welcome support from the community.

## License

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE)

MIT
