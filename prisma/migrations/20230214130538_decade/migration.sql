/*
  Warnings:

  - You are about to drop the column `decades` on the `Pedal` table. All the data in the column will be lost.
  - You are about to drop the column `decades` on the `Synthesizer` table. All the data in the column will be lost.
  - Added the required column `decade` to the `Pedal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `decade` to the `Synthesizer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pedal" DROP COLUMN "decades",
ADD COLUMN     "decade" "Decade" NOT NULL;

-- AlterTable
ALTER TABLE "Synthesizer" DROP COLUMN "decades",
ADD COLUMN     "decade" "Decade" NOT NULL;
