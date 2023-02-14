import { Prisma, PrismaClient } from '@prisma/client'
import { useSupabaseRowLevelSecurity } from '../../src'

export const authenticatedPrismaClient = new PrismaClient().$extends(
  useSupabaseRowLevelSecurity({
    claimsFn: () => ({
      aud: 'authenticated',
      sub: '1',
      role: 'authenticated',
    }),
    logging: false,
  })
)
