import { PrismaClient } from '@prisma/client';

export async function seedPickup(prisma: PrismaClient) {
  await prisma.pickup.createMany({
    data: []
  });
}
