import { PrismaClient } from '@prisma/client';

export async function seedRekomendasiTanam(prisma: PrismaClient) {
  await prisma.rekomendasiTanam.createMany({
    data: [
]
  });
}
