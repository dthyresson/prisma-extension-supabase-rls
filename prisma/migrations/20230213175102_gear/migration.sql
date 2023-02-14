-- CreateEnum
CREATE TYPE "Decade" AS ENUM ('YEAR_1960', 'YEAR_1970', 'YEAR_1980', 'YEAR_1990', 'YEAR_2000', 'YEAR_2010', 'YEAR_2020');

-- CreateEnum
CREATE TYPE "FormFactor" AS ENUM ('RACK', 'KEYBOARD', 'DESKTOP', 'EURO_RACK', 'MODULAR');

-- CreateEnum
CREATE TYPE "SignalType" AS ENUM ('ANALOG', 'DIGITAL');

-- CreateEnum
CREATE TYPE "Effect" AS ENUM ('ARPEGGIATOR', 'BIT_CRUSHER', 'CHORUS', 'COMPRESSOR', 'DELAY', 'DISTORTION', 'EQ', 'FILTER', 'FLANGER', 'FUZZ', 'LOOPER', 'OCTAVER', 'OVERDRIVE', 'PHASER', 'PITCH_SHIFTER', 'REVERB', 'RING_MODULATOR', 'SAMPLER', 'SEQUENCER', 'SLICER', 'TREMOLO', 'VIBRATO', 'VOCAL_PROCESSOR', 'WAH', 'OTHER');

-- CreateTable
CREATE TABLE "DrumMachine" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "decade" "Decade" NOT NULL,
    "signalType" "SignalType" NOT NULL,

    CONSTRAINT "DrumMachine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Synthesizer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "decades" "Decade"[],
    "formFactor" "FormFactor" NOT NULL,

    CONSTRAINT "Synthesizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "decades" "Decade"[],
    "effect" "Effect" NOT NULL,

    CONSTRAINT "Pedal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mixer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "decade" "Decade" NOT NULL,
    "channels" INTEGER NOT NULL,

    CONSTRAINT "Mixer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DrumMachine_name_brand_model_key" ON "DrumMachine"("name", "brand", "model");

-- CreateIndex
CREATE UNIQUE INDEX "Synthesizer_name_brand_model_key" ON "Synthesizer"("name", "brand", "model");

-- CreateIndex
CREATE UNIQUE INDEX "Pedal_name_brand_model_key" ON "Pedal"("name", "brand", "model");

-- CreateIndex
CREATE UNIQUE INDEX "Mixer_name_brand_model_key" ON "Mixer"("name", "brand", "model");
