import { Prisma, Decade } from '@prisma/client'

export const SYNTHS_ROLAND: Prisma.SynthesizerCreateInput[] = [
  {
    name: 'Roland Juno 106',
    brand: 'Roland',
    model: 'Juno 106',
    decade: Decade.YEAR_1980,
    formFactor: 'KEYBOARD',
  },
]

export const SYNTHS_YAMAHA: Prisma.SynthesizerCreateInput[] = [
  {
    name: 'Yamaha DX7',
    brand: 'Yamaha',
    model: 'DX7',
    decade: Decade.YEAR_1980,
    formFactor: 'KEYBOARD',
  },
]

export const SYNTHS: Prisma.SynthesizerCreateInput[] = [
  ...SYNTHS_ROLAND,
  ...SYNTHS_YAMAHA,
]
