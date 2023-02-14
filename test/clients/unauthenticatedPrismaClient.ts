import { Prisma, PrismaClient } from '@prisma/client'
import { useSupabaseRowLevelSecurity } from '../../src'

export const unauthenticatedPrismaClient = new PrismaClient().$extends(
  useSupabaseRowLevelSecurity({ logging: false })
)
