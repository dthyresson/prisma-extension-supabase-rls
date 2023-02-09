# useSupabaseRowLevelSecurity

`useSupabaseRowLevelSecurity` is a Prisma Client Extension supports [Supabase](https://supabase.com/docs) [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security#authrole) and policies written to use [Supabase's authentication system](https://supabase.com/docs/guides/auth/overview).

Using Postgres's "Row-Level-Security" policies, you can set rules on what data the anon key is allowed or not allowed to access by default.

Policies are PostgreSQL's rule engine. They are incredibly powerful and flexible, allowing you to [write complex SQL rules](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) which fit your unique business needs.

## Use

```ts
const unauthenticatedPrismaClient = new PrismaClient({
  datasources: { db: { url: process.env.RLS_DATABASE_URL } },
}).$extends(useSupabaseRowLevelSecurity())
```

```ts
const authenticatedDb = new PrismaClient({
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

```ts
const authenticatedDb = new PrismaClient({
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
1. npx primsa migrate dev

See [prisma/migrations/20230208161945_rls/migration.sql](prisma/migrations/20230208161945_rls/migration.sql)
## Testing


1. yarn test

## Contributing

Feel free to open issues and pull requests. We're always welcome support from the community.

## License

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE)

MIT
