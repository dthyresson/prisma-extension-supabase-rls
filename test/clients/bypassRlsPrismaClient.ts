import { Prisma, PrismaClient } from '@prisma/client'
import { useSupabaseRowLevelSecurity } from '../../src'

export const bypassRlsPrismaClient = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
})
