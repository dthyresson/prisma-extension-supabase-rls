import { Prisma, PrismaClient } from '@prisma/client'
import { useSupabaseRowLevelSecurity } from '../src'
import {
  authenticatedPrismaClient,
  bypassRlsPrismaClient,
  unauthenticatedPrismaClient,
} from './clients'

import {
  MIXERS_SOLID_STATE_LOGIC,
  MIXERS_SOUNDCRAFT,
} from './__fixtures__/mixers'

describe('useSupabaseRowLevelSecurity', () => {
  describe('with table policies that permit only delete and select', () => {
    describe('in an authentication scenario', () => {
      describe('select', () => {
        it('unauthenticated users should select Mixers', async () => {
          await bypassRlsPrismaClient.mixer.createMany({
            data: MIXERS_SOLID_STATE_LOGIC,
          })

          const mixers = await unauthenticatedPrismaClient.mixer.findMany({
            where: { brand: 'Solid State Logic' },
          })
          expect(mixers.length).toBe(0)
        })

        it('authenticated should select mixers with rls', async () => {
          await bypassRlsPrismaClient.mixer.createMany({
            data: MIXERS_SOUNDCRAFT,
          })

          const mixers = await authenticatedPrismaClient.mixer.findMany({
            where: { brand: 'Soundcraft' },
          })
          expect(mixers.length).toBe(1)
        })
      })

      describe('delete', () => {
        it('unauthenticated users should not delete a Mixer', async () => {
          const mixer = await bypassRlsPrismaClient.mixer.create({
            data: {
              name: 'Mackie Mix Series Mix5 5-Channel Mixer',
              brand: 'Mackie',
              model: 'Mix5',
              decade: 'YEAR_2020',
              channels: 5,
            },
          })
          expect(mixer).toBeDefined()

          expect(
            async () =>
              await unauthenticatedPrismaClient.mixer.delete({
                where: { id: mixer.id },
              })
          ).rejects.toThrowError('Not authorized.')

          const sameMixer = await bypassRlsPrismaClient.mixer.findUniqueOrThrow(
            {
              where: { id: mixer.id },
            }
          )

          expect(sameMixer).toBeDefined()
          expect(sameMixer).toEqual(mixer)
        })

        it('authenticated users should delete a Mixer', async () => {
          const mixer = await bypassRlsPrismaClient.mixer.create({
            data: {
              name: 'Yamaha MG10XU Analog Mixer',
              brand: 'Yamaha',
              model: 'MG10XU',
              decade: 'YEAR_2020',
              channels: 10,
            },
          })
          expect(mixer).toBeDefined()

          const deletedMixer = await authenticatedPrismaClient.mixer.delete({
            where: { id: mixer.id },
          })

          // exceptions are not thrown, but the mixer is deleted and data returns
          expect(deletedMixer).toEqual(mixer)

          // but we check that the mixer no longer exists
          expect(
            async () =>
              await bypassRlsPrismaClient.mixer.findUniqueOrThrow({
                where: { id: mixer.id },
              })
          ).rejects.toThrowError('No Mixer found')
        })
      })

      describe('update', () => {
        it('should not update a Mixer', async () => {
          const mixer = await bypassRlsPrismaClient.mixer.create({
            data: {
              name: 'Behringer X-Touch Extender',
              brand: 'Behringer',
              model: 'X-Touch Extender',
              decade: 'YEAR_2020',
              channels: 16,
            },
          })
          expect(mixer).toBeDefined()

          const updatedMixer = await authenticatedPrismaClient.mixer.update({
            data: {
              brand: 'Bearinjer',
            },
            where: { id: mixer.id },
          })

          // exceptions are not thrown, but the mixer is never modified
          expect(updatedMixer.brand).toEqual('Behringer')

          const sameMixer = await bypassRlsPrismaClient.mixer.findUniqueOrThrow(
            {
              where: { id: mixer.id },
            }
          )

          expect(sameMixer).toBeDefined()
          expect(sameMixer).toEqual(updatedMixer)
          expect(sameMixer.brand).toEqual('Behringer')
        })
      })

      describe('create', () => {
        it('authenticated users not should create a Mixer', async () => {
          expect(
            async () =>
              await authenticatedPrismaClient.mixer.create({
                data: {
                  name: 'Allen & Heath ZED-428',
                  brand: 'Allen & Heath',
                  model: 'ZED-428',
                  decade: 'YEAR_2000',
                  channels: 24,
                },
              })
          ).rejects.toThrowError('Not authorized.')
        })

        it('unauthenticated users should not create a Mixer', async () => {
          expect(
            async () =>
              await unauthenticatedPrismaClient.mixer.create({
                data: {
                  name: 'Roland AIRA MX-1 Mix Performer',
                  brand: 'Roland',
                  model: 'AIRA MX-1',
                  decade: 'YEAR_2010',
                  channels: 16,
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
              await customErrorDb.mixer.delete({
                where: { id: 1 },
              })
          ).rejects.toThrowError('Permission denied.')
        })
      })
    })
  })
})
