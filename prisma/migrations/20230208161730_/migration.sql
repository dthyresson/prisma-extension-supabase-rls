-- CreateEnum
CREATE TYPE "BodyStyle" AS ENUM ('Convertible', 'Coupe', 'Crossover', 'Electric', 'Hatchback', 'Hybrid', 'Minivan', 'Other', 'Pickup', 'Sedan', 'SUV', 'Truck', 'Van', 'Van_Minivan', 'Wagon');

-- CreateTable
CREATE TABLE "Car" (
    "id" SERIAL NOT NULL,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "bodyStyles" "BodyStyle"[],
    "ownerId" TEXT,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Car_year_make_model_key" ON "Car"("year", "make", "model");
