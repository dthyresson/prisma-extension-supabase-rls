import { Prisma, PrismaClient } from '@prisma/client'

import { useSupabaseRowLevelSecurity } from '../src'
import { ACURA, BMW } from './__fixtures__/cars'

describe('useSupabaseRowLevelSecurity', () => {
  const bypassRlsPrismaClient = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  })

  const unauthenticatedPrismaClient = new PrismaClient({
    datasources: { db: { url: process.env.RLS_DATABASE_URL } },
  }).$extends(useSupabaseRowLevelSecurity())

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

  it('should be defined', () => {
    expect(useSupabaseRowLevelSecurity).toBeDefined()
  })

  describe('select', () => {
    it('should not select cars', async () => {
      await bypassRlsPrismaClient.car.createMany({ data: ACURA })

      const cars = await unauthenticatedPrismaClient.car.findMany({
        where: { make: 'Acura' },
      })
      expect(cars.length).toBe(0)
    })

    it('should select cars with rls', async () => {
      await bypassRlsPrismaClient.car.createMany({ data: BMW })

      const cars = await authenticatedDb.car.findMany({
        where: { make: 'BMW' },
      })
      expect(cars.length).toBeGreaterThan(0)
    })
  })

  describe('delete', () => {
    // when unauthenticated with RLS enabled
    // when authenticated with RLS enabled
    it('should not delete a car', async () => {
      const car = await bypassRlsPrismaClient.car.create({
        data: {
          year: 1973,
          make: 'Porsche',
          model: '911S',
          bodyStyles: ['Coupe'],
        },
      })
      expect(car).toBeDefined()

      const deletedCar = await authenticatedDb.car.delete({
        where: { id: car.id },
      })

      const sameCar = await bypassRlsPrismaClient.car.findUniqueOrThrow({
        where: { id: car.id },
      })

      expect(sameCar).toBeDefined()
      expect(sameCar).toEqual(car)
    })
  })

  describe('update', () => {
    // when unauthenticated with RLS enabled
    // when authenticated with RLS enabled
    it('should not update a car', async () => {
      const car = await bypassRlsPrismaClient.car.create({
        data: {
          year: 1987,
          make: 'Volkswagen',
          model: 'GTI',
          bodyStyles: ['Hatchback'],
        },
      })
      expect(car).toBeDefined()

      const updatedCar = await authenticatedDb.car.update({
        data: {
          make: 'VW',
        },
        where: { id: car.id },
      })

      expect(updatedCar).toBeDefined()
      expect(updatedCar.make).not.toEqual('VW')

      const sameCar = await bypassRlsPrismaClient.car.findUniqueOrThrow({
        where: { id: car.id },
      })

      expect(sameCar).toBeDefined()
      expect(sameCar).toEqual(car)
      expect(sameCar.make).toEqual('Volkswagen')
    })
  })

  describe('create', () => {
    // when unauthenticated with RLS enabled
    // when authenticated with RLS enabled
    it('should not create a car', async () => {
      expect(
        async () =>
          await authenticatedDb.car.create({
            data: {
              year: 1984,
              make: 'Saab',
              model: '900S Turbo',
              bodyStyles: ['Hatchback'],
            },
          })
      ).rejects.toThrowError('Not authorized.')

      expect(
        async () =>
          await bypassRlsPrismaClient.car.findUniqueOrThrow({
            where: {
              year_make_model: {
                year: 1984,
                make: 'Saab',
                model: '900S Turbo',
              },
            },
          })
      ).rejects.toThrowError('No Car found')
    })
  })

  describe('Custom Error', () => {
    it('should throw a custom error', async () => {
      const customErrorDb = new PrismaClient({
        datasources: { db: { url: process.env.RLS_DATABASE_URL } },
      }).$extends(
        useSupabaseRowLevelSecurity({
          claimsFn: () => ({
            sub: '1',
          }),
          policyError: new Error('Not authorized yeah.'),
        })
      )

      expect(
        async () =>
          await customErrorDb.car.create({
            data: {
              year: 1984,
              make: 'Saab',
              model: '900S Turbo',
              bodyStyles: ['Hatchback'],
            },
          })
      ).rejects.toThrowError('Not authorized yeah.')

      expect(
        async () =>
          await bypassRlsPrismaClient.car.findUniqueOrThrow({
            where: {
              year_make_model: {
                year: 1984,
                make: 'Saab',
                model: '900S Turbo',
              },
            },
          })
      ).rejects.toThrowError('No Car found')
    })
  })
})
