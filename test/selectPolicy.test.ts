import { Prisma, PrismaClient } from '@prisma/client'
import { useSupabaseRowLevelSecurity } from '../src'
import {
  authenticatedPrismaClient,
  bypassRlsPrismaClient,
  unauthenticatedPrismaClient,
} from './clients'

import {
  DRUM_MACHINES_ROLAND,
  DRUM_MACHINES_YAMAHA,
} from './__fixtures__/drumMachines'

describe('useSupabaseRowLevelSecurity', () => {
  describe('with table policies that permit only select', () => {
    describe('in an authentication scenario', () => {
      describe('select', () => {
        it('unauthenticated users should not select Drum Machines', async () => {
          await bypassRlsPrismaClient.drumMachine.createMany({
            data: DRUM_MACHINES_ROLAND,
          })

          const drumMachines =
            await unauthenticatedPrismaClient.drumMachine.findMany({
              where: { brand: 'Roland' },
            })
          expect(drumMachines.length).toBe(0)
        })

        it('authenticated should select drumMachines with rls', async () => {
          await bypassRlsPrismaClient.drumMachine.createMany({
            data: DRUM_MACHINES_YAMAHA,
          })

          const drumMachines =
            await authenticatedPrismaClient.drumMachine.findMany({
              where: { brand: 'Yamaha' },
            })
          expect(drumMachines.length).toBeGreaterThan(0)
        })
      })

      describe('delete', () => {
        it('should not delete a Drum Machine', async () => {
          const drumMachine = await bypassRlsPrismaClient.drumMachine.create({
            data: {
              name: 'Alesis SR-16',
              brand: 'Alesis',
              model: 'SR-16',
              decade: 'YEAR_1990',
              signalType: 'ANALOG',
            },
          })
          expect(drumMachine).toBeDefined()

          const deletedDrumMachine =
            await authenticatedPrismaClient.drumMachine.delete({
              where: { id: drumMachine.id },
            })

          const sameDrumMachine =
            await bypassRlsPrismaClient.drumMachine.findUniqueOrThrow({
              where: { id: drumMachine.id },
            })

          expect(sameDrumMachine).toBeDefined()
          expect(sameDrumMachine).toEqual(drumMachine)
        })
      })

      describe('update', () => {
        it('should not update a Drum Machine', async () => {
          const drumMachine = await bypassRlsPrismaClient.drumMachine.create({
            data: {
              name: 'Amdek Rhythm Machine RMK-100',
              brand: 'Amdek',
              model: 'RMK-100',
              decade: 'YEAR_1980',
              signalType: 'ANALOG',
            },
          })
          expect(drumMachine).toBeDefined()

          const updatedDrumMachine =
            await authenticatedPrismaClient.drumMachine.update({
              data: {
                brand: 'BOSS',
              },
              where: { id: drumMachine.id },
            })

          expect(updatedDrumMachine).toBeDefined()
          expect(updatedDrumMachine.brand).not.toEqual('BOSS')

          const sameDrumMachine =
            await bypassRlsPrismaClient.drumMachine.findUniqueOrThrow({
              where: { id: drumMachine.id },
            })

          expect(sameDrumMachine).toBeDefined()
          expect(sameDrumMachine).toEqual(drumMachine)
          expect(sameDrumMachine.brand).toEqual('Amdek')
        })
      })

      describe('create', () => {
        it('should not create a Drum Machine', async () => {
          expect(
            async () =>
              await authenticatedPrismaClient.drumMachine.create({
                data: {
                  name: 'Sony DRP-1 Digital Drum Pad',
                  brand: 'Sony',
                  model: 'DRP-1',
                  decade: 'YEAR_1980',
                  signalType: 'DIGITAL',
                },
              })
          ).rejects.toThrowError('Not authorized.')

          expect(
            async () =>
              await bypassRlsPrismaClient.drumMachine.findUniqueOrThrow({
                where: {
                  name_brand_model: {
                    name: 'Sony DRP-1 Digital Drum Pad',
                    brand: 'Sony',
                    model: 'DRP-1',
                  },
                },
              })
          ).rejects.toThrowError('No DrumMachine found')
        })
      })
    })
  })
})
