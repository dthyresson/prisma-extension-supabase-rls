import { Prisma, Decade } from '@prisma/client'

export const PEDALS_BOSS: Prisma.PedalCreateInput[] = [
  {
    name: 'Boss DS-1',
    brand: 'Boss',
    model: 'DS-1',
    decade: Decade.YEAR_1980,
    effect: 'DISTORTION',
  },
]

export const PEDALS_ELECTRO_HARMONIX: Prisma.PedalCreateInput[] = [
  {
    name: 'Electro-Harmonix Memory Man',
    brand: 'Electro-Harmonix',
    model: 'Memory Man',
    decade: Decade.YEAR_1990,
    effect: 'DELAY',
  },
]

export const PEDALS: Prisma.PedalCreateInput[] = [
  ...PEDALS_BOSS,
  ...PEDALS_ELECTRO_HARMONIX,
]
