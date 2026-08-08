import { PrismaClient } from '@prisma/client';

export async function seedTender(prisma: PrismaClient) {
  await prisma.tender.createMany({
    data: []
  });
}
