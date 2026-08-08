import { PrismaClient } from '@prisma/client';

export async function seedQualityControl(prisma: PrismaClient) {
  await prisma.qualityControl.createMany({
    data: []
  });
}
