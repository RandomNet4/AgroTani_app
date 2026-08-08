import { PrismaClient } from '@prisma/client';

export async function seedJejakPanen(prisma: PrismaClient) {
  await prisma.jejakPanen.createMany({
    data: []
  });
  await prisma.jejakPanenTimeline.createMany({
    data: []
  });
}
