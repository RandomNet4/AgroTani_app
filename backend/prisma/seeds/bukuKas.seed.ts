import { PrismaClient } from '@prisma/client';

export async function seedBukuKas(prisma: PrismaClient) {
  await prisma.bukuKas.createMany({
    data: []
  });
}
