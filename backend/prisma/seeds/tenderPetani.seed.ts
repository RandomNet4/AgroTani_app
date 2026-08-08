import { PrismaClient } from '@prisma/client';

export async function seedTenderPetani(prisma: PrismaClient) {
  await prisma.tenderPetani.createMany({
    data: []
  });
}
