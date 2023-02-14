import { Prisma, Decade, SignalType } from '@prisma/client'

export const DRUM_MACHINES_ROLAND: Prisma.DrumMachineCreateInput[] = [
  {
    name: 'Roland TR-808',
    brand: 'Roland',
    model: 'TR-808',
    decade: Decade.YEAR_1980,
    signalType: SignalType.ANALOG,
  },
]

export const DRUM_MACHINES_YAMAHA: Prisma.DrumMachineCreateInput[] = [
  {
    name: 'Yamaha RX7',
    brand: 'Yamaha',
    model: 'RX7',
    decade: Decade.YEAR_1980,
    signalType: SignalType.DIGITAL,
  },
]

export const DRUM_MACHINES: Prisma.DrumMachineCreateInput[] = [
  ...DRUM_MACHINES_ROLAND,
  ...DRUM_MACHINES_YAMAHA,
]
