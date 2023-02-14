import { Prisma, PrismaClient } from '@prisma/client'
import { useSupabaseRowLevelSecurity } from '../src'
import {
  authenticatedPrismaClient,
  bypassRlsPrismaClient,
  unauthenticatedPrismaClient,
} from './clients'

import { SYNTHS_ROLAND, SYNTHS_YAMAHA } from './__fixtures__/synthesizers'

describe('useSupabaseRowLevelSecurity', () => {
  describe('with table policies that permit only insert and select', () => {
    describe('in an authentication scenario', () => {
      describe('select', () => {
        it('unauthenticated users should select Synths', async () => {
          await bypassRlsPrismaClient.synthesizer.createMany({
            data: SYNTHS_ROLAND,
          })

          const synths = await unauthenticatedPrismaClient.synthesizer.findMany(
            {
              where: { brand: 'Roland' },
            }
          )
          expect(synths.length).toBe(0)
        })

        it('authenticated should select synths with rls', async () => {
          await bypassRlsPrismaClient.synthesizer.createMany({
            data: SYNTHS_YAMAHA,
          })

          const synths = await authenticatedPrismaClient.synthesizer.findMany({
            where: { brand: 'Yamaha' },
          })
          expect(synths.length).toBe(1)
        })
      })

      describe('delete', () => {
        it('should not delete a Synthesizer', async () => {
          const synth = await bypassRlsPrismaClient.synthesizer.create({
            data: {
              name: 'Elka Synthex',
              brand: 'Elka',
              model: 'Synthex',
              decade: 'YEAR_1980',
              formFactor: 'KEYBOARD',
            },
          })
          expect(synth).toBeDefined()

          const deletedSynth =
            await authenticatedPrismaClient.synthesizer.delete({
              where: { id: synth.id },
            })

          // exceptions are not thrown, but the synth is never deleted
          expect(deletedSynth).toEqual(synth)

          const sameSynth =
            await bypassRlsPrismaClient.synthesizer.findUniqueOrThrow({
              where: { id: synth.id },
            })

          expect(sameSynth).toBeDefined()
          expect(sameSynth).toEqual(synth)
        })
      })

      describe('update', () => {
        it('should not update a Synthesizer', async () => {
          const synth = await bypassRlsPrismaClient.synthesizer.create({
            data: {
              name: 'Korg MS-20',
              brand: 'Korg',
              model: 'MS-20',
              decade: 'YEAR_1980',
              formFactor: 'KEYBOARD',
            },
          })
          expect(synth).toBeDefined()

          const updatedSynth =
            await authenticatedPrismaClient.synthesizer.update({
              data: {
                model: 'MS-10',
              },
              where: { id: synth.id },
            })

          // exceptions are not thrown, but the synth is never modified
          expect(updatedSynth).toEqual(synth)

          const sameSynth =
            await bypassRlsPrismaClient.synthesizer.findUniqueOrThrow({
              where: { id: synth.id },
            })

          expect(sameSynth).toBeDefined()
          expect(sameSynth).toEqual(synth)
          expect(sameSynth.model).toEqual('MS-20')
        })
      })

      describe('create', () => {
        it('authenticated users should create a Synthesizer', async () => {
          const synth = await authenticatedPrismaClient.synthesizer.create({
            data: {
              name: 'Sequential Prophet-5',
              brand: 'Sequential',
              model: 'Prophet-5',
              decade: 'YEAR_1980',
              formFactor: 'KEYBOARD',
            },
          })

          expect(synth.name).toEqual('Sequential Prophet-5')
        })

        it('unauthenticated users should not create a Synthesizer', async () => {
          expect(
            async () =>
              await unauthenticatedPrismaClient.synthesizer.create({
                data: {
                  name: 'Casio CZ-101',
                  brand: 'Casio',
                  model: 'CZ-101',
                  decade: 'YEAR_1980',
                  formFactor: 'KEYBOARD',
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
              policyError: new Error('You lack permissions to do this.'),
            })
          )

          expect(
            async () =>
              await customErrorDb.synthesizer.create({
                data: {
                  name: 'ARP Odyssey MKII',
                  brand: 'ARP',
                  model: 'Odyssey MKII',
                  decade: 'YEAR_1980',
                  formFactor: 'KEYBOARD',
                },
              })
          ).rejects.toThrowError('You lack permissions to do this.')

          expect(
            async () =>
              await bypassRlsPrismaClient.synthesizer.findUniqueOrThrow({
                where: {
                  name_brand_model: {
                    name: 'ARP Odyssey MKII',
                    brand: 'ARP',
                    model: 'Odyssey MKII',
                  },
                },
              })
          ).rejects.toThrowError('No Synthesizer found')
        })
      })
    })
  })
})
