import { Prisma, Decade } from '@prisma/client'

export const MIXERS_SOLID_STATE_LOGIC: Prisma.MixerCreateInput[] = [
  {
    name: 'Solid State Logic XL-Desk SuperAnalogue',
    brand: 'Solid State Logic',
    model: 'SuperAnalogue',
    decade: Decade.YEAR_2010,
    channels: 24,
  },
]

export const MIXERS_SOUNDCRAFT: Prisma.MixerCreateInput[] = [
  {
    name: 'Soundcraft MH4 Console 48 CH',
    brand: 'Soundcraft',
    model: 'MH4',
    decade: Decade.YEAR_2010,
    channels: 48,
  },
]

export const PEDALS: Prisma.MixerCreateInput[] = [
  ...MIXERS_SOLID_STATE_LOGIC,
  ...MIXERS_SOUNDCRAFT,
]
