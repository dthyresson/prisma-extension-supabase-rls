import { Prisma, PrismaClient } from '@prisma/client'
import { useSupabaseRowLevelSecurity } from '../src'
import {
  authenticatedPrismaClient,
  bypassRlsPrismaClient,
  unauthenticatedPrismaClient,
} from './clients'

import { PEDALS_ELECTRO_HARMONIX, PEDALS_BOSS } from './__fixtures__/pedals'

describe('useSupabaseRowLevelSecurity', () => {
  describe('with table policies that permit only update and select', () => {
    describe('in an authentication scenario', () => {
      describe('select', () => {
        it('unauthenticated users should select Pedals', async () => {
          await bypassRlsPrismaClient.pedal.createMany({
            data: PEDALS_ELECTRO_HARMONIX,
          })

          const pedals = await unauthenticatedPrismaClient.pedal.findMany({
            where: { brand: 'Electro-Harmonix' },
          })
          expect(pedals.length).toBe(0)
        })

        it('authenticated should select pedals with rls', async () => {
          await bypassRlsPrismaClient.pedal.createMany({
            data: PEDALS_BOSS,
          })

          const pedals = await authenticatedPrismaClient.pedal.findMany({
            where: { brand: 'Boss' },
          })
          expect(pedals.length).toBe(1)
        })
      })

      describe('delete', () => {
        it('should not delete a Pedal', async () => {
          const pedal = await bypassRlsPrismaClient.pedal.create({
            data: {
              name: 'Maestro Fuzz-Tone FZ-1',
              brand: 'Maestro',
              model: 'Fuzz-Tone FZ-1',
              decade: 'YEAR_1960',
              effect: 'FUZZ',
            },
          })
          expect(pedal).toBeDefined()

          const deletedPedal = await authenticatedPrismaClient.pedal.delete({
            where: { id: pedal.id },
          })

          // exceptions are not thrown, but the pedal is never deleted
          expect(deletedPedal).toEqual(pedal)

          const samePedal = await bypassRlsPrismaClient.pedal.findUniqueOrThrow(
            {
              where: { id: pedal.id },
            }
          )

          expect(samePedal).toBeDefined()
          expect(samePedal).toEqual(pedal)
        })
      })

      describe('update', () => {
        it('should update a Pedal', async () => {
          const pedal = await bypassRlsPrismaClient.pedal.create({
            data: {
              name: 'JHS 3 Series Reverb',
              brand: 'JSH',
              model: '3 Series Reverb',
              decade: 'YEAR_2020',
              effect: 'REVERB',
            },
          })
          expect(pedal).toBeDefined()

          const updatedPedal = await authenticatedPrismaClient.pedal.update({
            data: {
              brand: 'JHS',
            },
            where: { id: pedal.id },
          })

          // exceptions are not thrown, but the pedal is never modified
          expect(updatedPedal.brand).toEqual('JHS')

          const samePedal = await bypassRlsPrismaClient.pedal.findUniqueOrThrow(
            {
              where: { id: pedal.id },
            }
          )

          expect(samePedal).toBeDefined()
          expect(samePedal).toEqual(updatedPedal)
          expect(samePedal.brand).toEqual('JHS')
        })
      })

      describe('create', () => {
        it('authenticated users not should create a Pedal', async () => {
          expect(
            async () =>
              await authenticatedPrismaClient.pedal.create({
                data: {
                  name: 'MXR Phase 90',
                  brand: 'MXR',
                  model: 'Phase 90',
                  decade: 'YEAR_1980',
                  effect: 'PHASER',
                },
              })
          ).rejects.toThrowError('Not authorized.')
        })

        it('unauthenticated users should not create a Pedal', async () => {
          expect(
            async () =>
              await unauthenticatedPrismaClient.pedal.create({
                data: {
                  name: ' Mutron III Envelope Filter',
                  brand: 'Mutron',
                  model: 'Mutron III',
                  decade: 'YEAR_1970',
                  effect: 'WAH',
                },
              })
          ).rejects.toThrowError('Not authorized.')
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
              policyError: new Error('Permission denied.'),
            })
          )

          expect(
            async () =>
              await customErrorDb.pedal.update({
                data: {
                  name: 'Danelectro Cool Cat Tremolo',
                  brand: 'Danelectro',
                  model: 'Cool Cat',
                  decade: 'YEAR_1980',
                  effect: 'TREMOLO',
                },
                where: { id: 1 },
              })
          ).rejects.toThrowError('Permission denied.')

          expect(
            async () =>
              await bypassRlsPrismaClient.pedal.findUniqueOrThrow({
                where: {
                  name_brand_model: {
                    name: 'Danelectro Cool Cat Tremolo',
                    brand: 'Danelectro',
                    model: 'Cool Cat',
                  },
                },
              })
          ).rejects.toThrowError('No Pedal found')
        })
      })
    })
  })
})
